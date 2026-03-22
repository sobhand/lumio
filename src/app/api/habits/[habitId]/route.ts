import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { habitId } = await params;
  const data = await req.json();

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, createdById: user.id },
  });
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (data.name) updateData.name = data.name;
  if (data.category) updateData.category = data.category;
  if (data.difficulty) updateData.difficulty = data.difficulty;
  if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;

  const updated = await prisma.habit.update({
    where: { id: habitId },
    data: updateData,
  });

  // Update child assignments if provided
  if (data.childIds) {
    await prisma.childHabit.deleteMany({ where: { habitId } });
    if (data.childIds.length > 0) {
      await prisma.childHabit.createMany({
        data: data.childIds.map((childId: string) => ({
          childId,
          habitId,
        })),
      });
    }
  }

  return NextResponse.json({ habit: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { habitId } = await params;

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, createdById: user.id },
  });
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  await prisma.habit.delete({ where: { id: habitId } });
  return NextResponse.json({ success: true });
}
