import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getAgeGroup(age: number): string {
  if (age <= 5) return "3-5";
  if (age <= 8) return "6-8";
  return "9-10";
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const children = await prisma.child.findMany({
    where: { parentId: user.id },
    include: {
      streaks: true,
      childHabits: { where: { isActive: true }, include: { habit: true } },
      achievements: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ children });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, age, avatar } = await req.json();

  if (!name || !age) {
    return NextResponse.json({ error: "Name and age are required" }, { status: 400 });
  }

  const child = await prisma.child.create({
    data: {
      name,
      age: Number(age),
      ageGroup: getAgeGroup(Number(age)),
      avatar: avatar || "sun",
      parentId: user.id,
    },
  });

  // Create streak record
  await prisma.streak.create({
    data: { childId: child.id },
  });

  return NextResponse.json({ child }, { status: 201 });
}
