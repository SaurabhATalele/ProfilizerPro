import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/Utils/api/auth";
import { seedInterviewPrep } from "@/Utils/api/seed/interviewPrepSeed";

/**
 * POST /api/v1/interview-prep/seed — insert the predefined content (admin
 * only). Idempotent: a no-op once any Subject exists. Provided so the library
 * can be seeded in-app without a separate TypeScript runner.
 */
export async function POST(_req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const summary = await seedInterviewPrep();
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("interview-prep/seed error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
