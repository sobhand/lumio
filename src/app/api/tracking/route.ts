import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { difficultyPoints } from "@/lib/habits-templates";
import { format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  const date = req.nextUrl.searchParams.get("date") || format(new Date(), "yyyy-MM-dd");
  const days = Number(req.nextUrl.searchParams.get("days") || "1");

  if (!childId) {
    return NextResponse.json({ error: "childId is required" }, { status: 400 });
  }

  // Verify child belongs to user
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: user.id },
  });
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  // Get active habits for this child
  const childHabits = await prisma.childHabit.findMany({
    where: { childId, isActive: true },
    include: { habit: true },
  });

  if (days === 1) {
    // Get logs for the specific date
    const logs = await prisma.habitLog.findMany({
      where: { childId, date },
      include: { childHabit: { include: { habit: true } } },
    });

    // Build full daily view (all habits + their status)
    const dailyHabits = childHabits.map((ch) => {
      const log = logs.find((l) => l.childHabitId === ch.id);
      return {
        childHabitId: ch.id,
        habitId: ch.habit.id,
        name: ch.habit.name,
        category: ch.habit.category,
        difficulty: ch.habit.difficulty,
        completed: log?.completed || false,
        logId: log?.id || null,
        points: log?.points || 0,
      };
    });

    return NextResponse.json({ date, habits: dailyHabits });
  }

  // History view: get logs for last N days
  const dates = Array.from({ length: days }, (_, i) =>
    format(subDays(new Date(date), i), "yyyy-MM-dd")
  );

  const logs = await prisma.habitLog.findMany({
    where: { childId, date: { in: dates } },
    include: { childHabit: { include: { habit: true } } },
  });

  const history = dates.map((d) => {
    const dayLogs = logs.filter((l) => l.date === d);
    const completed = dayLogs.filter((l) => l.completed).length;
    return {
      date: d,
      total: childHabits.length,
      completed,
      ratio: childHabits.length > 0 ? completed / childHabits.length : 0,
    };
  });

  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { childHabitId, date: dateParam, completed } = await req.json();
  const date = dateParam || format(new Date(), "yyyy-MM-dd");

  if (!childHabitId) {
    return NextResponse.json({ error: "childHabitId is required" }, { status: 400 });
  }

  // Verify ownership
  const childHabit = await prisma.childHabit.findUnique({
    where: { id: childHabitId },
    include: { child: true, habit: true },
  });
  if (!childHabit || childHabit.child.parentId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const points = completed ? difficultyPoints[childHabit.habit.difficulty] || 5 : 0;

  // Upsert the log
  const log = await prisma.habitLog.upsert({
    where: {
      childHabitId_date: { childHabitId, date },
    },
    create: {
      childHabitId,
      childId: childHabit.childId,
      date,
      completed: completed !== false,
      completedAt: completed !== false ? new Date() : null,
      points,
    },
    update: {
      completed: completed !== false,
      completedAt: completed !== false ? new Date() : null,
      points,
    },
  });

  // Update child points
  if (completed) {
    await prisma.child.update({
      where: { id: childHabit.childId },
      data: { points: { increment: points } },
    });
  }

  // Update streak
  await updateStreak(childHabit.childId, date);

  // Check achievements
  await checkAchievements(childHabit.childId, date);

  return NextResponse.json({ log });
}

async function updateStreak(childId: string, date: string) {
  const today = date;
  const yesterday = format(subDays(new Date(date), 1), "yyyy-MM-dd");

  // Get all active child habits
  const childHabits = await prisma.childHabit.findMany({
    where: { childId, isActive: true },
  });

  if (childHabits.length === 0) return;

  // Check if all habits completed today
  const todayLogs = await prisma.habitLog.findMany({
    where: { childId, date: today, completed: true },
  });

  const allCompletedToday = todayLogs.length >= childHabits.length;

  const streak = await prisma.streak.findUnique({ where: { childId } });
  if (!streak) return;

  if (allCompletedToday) {
    let newStreak = 1;
    if (streak.lastDate === yesterday) {
      newStreak = streak.currentStreak + 1;
    } else if (streak.lastDate === today) {
      newStreak = streak.currentStreak;
    }

    await prisma.streak.update({
      where: { childId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastDate: today,
      },
    });
  }
}

async function checkAchievements(childId: string, date: string) {
  const streak = await prisma.streak.findUnique({ where: { childId } });
  if (!streak) return;

  const childHabits = await prisma.childHabit.findMany({
    where: { childId, isActive: true },
  });
  const todayLogs = await prisma.habitLog.findMany({
    where: { childId, date, completed: true },
  });

  const achievements: { type: string; title: string }[] = [];

  // First completion
  if (todayLogs.length >= 1) {
    achievements.push({ type: "first_complete", title: "First Step" });
  }

  // Full day
  if (todayLogs.length >= childHabits.length && childHabits.length > 0) {
    achievements.push({ type: "full_day", title: "Perfect Day" });
  }

  // Streak milestones
  if (streak.currentStreak >= 3) {
    achievements.push({ type: "streak_3", title: "3-Day Streak" });
  }
  if (streak.currentStreak >= 7) {
    achievements.push({ type: "streak_7", title: "Week Warrior" });
  }
  if (streak.currentStreak >= 14) {
    achievements.push({ type: "streak_14", title: "Two-Week Champion" });
  }
  if (streak.currentStreak >= 30) {
    achievements.push({ type: "streak_30", title: "Monthly Master" });
  }

  // Points milestones
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (child && child.points >= 100) {
    achievements.push({ type: "points_100", title: "Century Club" });
  }
  if (child && child.points >= 500) {
    achievements.push({ type: "points_500", title: "Rising Star" });
  }

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { childId_type: { childId, type: a.type } },
      create: { childId, type: a.type, title: a.title },
      update: {},
    });
  }
}
