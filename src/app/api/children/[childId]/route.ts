import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getAgeGroup(age: number): string {
  if (age <= 5) return "3-5";
  if (age <= 8) return "6-8";
  return "9-10";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { childId } = await params;

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: user.id },
    include: {
      streaks: true,
      childHabits: { where: { isActive: true }, include: { habit: true } },
      achievements: { orderBy: { earnedAt: "desc" } },
    },
  });

  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });
  return NextResponse.json({ child });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { childId } = await params;
  const data = await req.json();

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: user.id },
  });
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (data.name) updateData.name = data.name;
  if (data.age) {
    updateData.age = Number(data.age);
    updateData.ageGroup = getAgeGroup(Number(data.age));
  }
  if (data.avatar) updateData.avatar = data.avatar;

  const updated = await prisma.child.update({
    where: { id: childId },
    data: updateData,
  });

  return NextResponse.json({ child: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { childId } = await params;

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: user.id },
  });
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  await prisma.child.delete({ where: { id: childId } });
  return NextResponse.json({ success: true });
}
