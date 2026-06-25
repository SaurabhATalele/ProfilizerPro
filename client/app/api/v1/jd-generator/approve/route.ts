import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import connectdb from "@/Utils/api/db/connectDB";
import { approveAsTest } from "@/Utils/api/Controllers/JDGeneratorController";
import { LLMTimeoutError } from "@/Utils/api/llm/LLMClient";
import type { ApproveMeta } from "@/Utils/types/JDGenerator";

interface ApproveBody {
  generatedQuestionSetId: string;
  title: string;
  duration: number;
  passingScore: number;
}

/**
 * POST /api/v1/jd-generator/approve — publish an approved set as a Test.
 *
 * Body: `{ generatedQuestionSetId, title, duration, passingScore }`. Validates
 * `passingScore ∈ [0, 100]`, maps questions, creates the `Assignment` +
 * `Question` documents, and returns `{ testId }`.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }

  try {
    await connectdb();
    const userId = user.userId ?? user.email;

    const body = (await req.json()) as ApproveBody;
    const meta: ApproveMeta = {
      title: body.title,
      duration: body.duration,
      passingScore: body.passingScore,
    };

    const result = await approveAsTest(body.generatedQuestionSetId, meta, userId);
    if (!result.ok) {
      const status = result.error === "not_found" ? 404 : 400; // invalid_score → 400
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ testId: result.testId }, { status: 200 });
  } catch (error) {
    if (error instanceof LLMTimeoutError) {
      return NextResponse.json({ error: "llm_timeout" }, { status: 504 });
    }
    console.error("jd-generator/approve error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
