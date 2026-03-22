import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: user.id },
    include: {
      streaks: true,
      achievements: { orderBy: { earnedAt: "desc" } },
    },
  });
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  const today = format(new Date(), "yyyy-MM-dd");

  // Weekly stats
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), "yyyy-MM-dd")
  );

  const weekLogs = await prisma.habitLog.findMany({
    where: { childId, date: { in: weekDates }, completed: true },
  });

  const childHabits = await prisma.childHabit.findMany({
    where: { childId, isActive: true },
  });

  const totalPossible = childHabits.length * 7;
  const weeklyCompletion = totalPossible > 0 ? weekLogs.length / totalPossible : 0;

  // Today's progress
  const todayLogs = await prisma.habitLog.findMany({
    where: { childId, date: today, completed: true },
  });

  // Daily breakdown for the week
  const dailyBreakdown = weekDates.map((d) => ({
    date: d,
    completed: weekLogs.filter((l) => l.date === d).length,
    total: childHabits.length,
  })).reverse();

  return NextResponse.json({
    points: child.points,
    streak: child.streaks?.[0] || { currentStreak: 0, longestStreak: 0 },
    achievements: child.achievements,
    today: {
      completed: todayLogs.length,
      total: childHabits.length,
      ratio: childHabits.length > 0 ? todayLogs.length / childHabits.length : 0,
    },
    weekly: {
      completion: weeklyCompletion,
      breakdown: dailyBreakdown,
    },
  });
}
