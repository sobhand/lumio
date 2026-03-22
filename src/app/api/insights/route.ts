import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format, subDays } from "date-fns";
import { getParentMessage } from "@/lib/wisdom";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");

  const children = await prisma.child.findMany({
    where: { parentId: user.id },
    include: { streaks: true },
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), "yyyy-MM-dd")
  );

  const insights = [];

  for (const child of children) {
    if (childId && child.id !== childId) continue;

    const childHabits = await prisma.childHabit.findMany({
      where: { childId: child.id, isActive: true },
      include: { habit: true },
    });

    const todayLogs = await prisma.habitLog.findMany({
      where: { childId: child.id, date: today, completed: true },
    });

    const weekLogs = await prisma.habitLog.findMany({
      where: { childId: child.id, date: { in: weekDates }, completed: true },
      include: { childHabit: { include: { habit: true } } },
    });

    const todayRatio = childHabits.length > 0 ? todayLogs.length / childHabits.length : 0;
    const weekTotal = childHabits.length * 7;
    const weekRatio = weekTotal > 0 ? weekLogs.length / weekTotal : 0;
    const streak = child.streaks?.[0]?.currentStreak || 0;

    // Find strongest and weakest categories
    const categoryStats: Record<string, { completed: number; total: number }> = {};
    for (const ch of childHabits) {
      const cat = ch.habit.category;
      if (!categoryStats[cat]) categoryStats[cat] = { completed: 0, total: 7 };
      categoryStats[cat].completed += weekLogs.filter(
        (l) => l.childHabit.habitId === ch.habitId
      ).length;
    }

    const strongest = Object.entries(categoryStats).sort(
      (a, b) => b[1].completed / b[1].total - a[1].completed / a[1].total
    )[0];
    const weakest = Object.entries(categoryStats).sort(
      (a, b) => a[1].completed / a[1].total - b[1].completed / b[1].total
    )[0];

    const wisdomMessage = getParentMessage({
      completionRatio: weekRatio,
      streak,
      childCount: children.length,
    });

    insights.push({
      childId: child.id,
      childName: child.name,
      todayCompleted: todayLogs.length,
      todayTotal: childHabits.length,
      todayRatio,
      weeklyCompletion: weekRatio,
      streak,
      strongestCategory: strongest ? strongest[0] : null,
      weakestCategory: weakest ? weakest[0] : null,
      wisdom: wisdomMessage,
      habitCount: childHabits.length,
    });
  }

  return NextResponse.json({ insights });
}
