import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks: Record<string, unknown> = {
    time: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
    },
  };

  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    checks.database = { status: "connected", result };
  } catch (err) {
    checks.database = {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  const allGood = (checks.database as Record<string, unknown>)?.status === "connected";

  return NextResponse.json(
    { status: allGood ? "ok" : "unhealthy", checks },
    { status: allGood ? 200 : 500 }
  );
}
