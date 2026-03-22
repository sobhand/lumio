import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSuggestedHabits } from "@/lib/habits-templates";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ageGroup = req.nextUrl.searchParams.get("ageGroup") || "6-8";
  const templates = getSuggestedHabits(ageGroup);

  return NextResponse.json({ templates });
}
