import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");

  if (childId) {
    // Get habits for a specific child
    const childHabits = await prisma.childHabit.findMany({
      where: { childId, isActive: true },
      include: { habit: true },
    });
    return NextResponse.json({ habits: childHabits.map((ch) => ({ ...ch.habit, childHabitId: ch.id })) });
  }

  // Get all habits created by this user
  const habits = await prisma.habit.findMany({
    where: { createdById: user.id },
    include: { childHabits: { include: { child: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ habits });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, category, difficulty, childIds } = await req.json();

  if (!name || !category) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }

  const habit = await prisma.habit.create({
    data: {
      name,
      category,
      difficulty: difficulty || "easy",
      createdById: user.id,
    },
  });

  // Assign to children if provided
  if (childIds && childIds.length > 0) {
    await prisma.childHabit.createMany({
      data: childIds.map((childId: string) => ({
        childId,
        habitId: habit.id,
      })),
    });
  }

  return NextResponse.json({ habit }, { status: 201 });
}
