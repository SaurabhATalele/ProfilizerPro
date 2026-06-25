import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import connectdb from "@/Utils/api/db/connectDB";
import { generateQuestionSet } from "@/Utils/api/Controllers/QuestionGeneratorController";
import { LLMTimeoutError } from "@/Utils/api/llm/LLMClient";
import type { GenerationInput } from "@/Utils/types/JDGenerator";

/**
 * POST /api/v1/jd-generator/generate — Stage 2.
 *
 * Body: `{ jobDescriptionId, confirmedSignal, mix, difficulty, preferredLanguages? }`.
 * Runs generation from a confirmed signal and persists the staging set.
 * Returns `{ generatedQuestionSetId, questions, shortfall }`.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }

  try {
    await connectdb();
    const userId = user.userId ?? user.email;

    const body = (await req.json()) as GenerationInput;
    const input: GenerationInput = {
      jobDescriptionId: body.jobDescriptionId,
      confirmedSignal: body.confirmedSignal,
      mix: body.mix,
      difficulty: body.difficulty,
      preferredLanguages: body.preferredLanguages,
    };

    const result = await generateQuestionSet(input, userId);
    if (!result.ok) {
      // generation_failed
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json(
      {
        generatedQuestionSetId: String(result.set._id),
        questions: result.set.questions,
        shortfall: result.shortfall,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof LLMTimeoutError) {
      return NextResponse.json({ error: "llm_timeout" }, { status: 504 });
    }
    console.error("jd-generator/generate error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
