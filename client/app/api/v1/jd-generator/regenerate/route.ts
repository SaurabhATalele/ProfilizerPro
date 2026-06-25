import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import connectdb from "@/Utils/api/db/connectDB";
import { regenerateQuestion } from "@/Utils/api/Controllers/QuestionGeneratorController";
import { LLMTimeoutError } from "@/Utils/api/llm/LLMClient";

interface RegenerateBody {
  generatedQuestionSetId: string;
  index: number;
}

/**
 * POST /api/v1/jd-generator/regenerate — single-question regeneration.
 *
 * Body: `{ generatedQuestionSetId, index }`. Cooldown-gated against
 * `lastRegenerationAt`; replaces only the question at `index`.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }

  try {
    await connectdb();
    const userId = user.userId ?? user.email;

    const body = (await req.json()) as RegenerateBody;
    const result = await regenerateQuestion(
      body.generatedQuestionSetId,
      body.index,
      userId,
    );

    if (!result.ok) {
      let status: number;
      switch (result.error) {
        case "rate_limited":
          status = 429;
          break;
        case "not_found":
          status = 404;
          break;
        case "bad_index":
        default:
          status = 400;
          break;
      }
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ set: result.set }, { status: 200 });
  } catch (error) {
    if (error instanceof LLMTimeoutError) {
      return NextResponse.json({ error: "llm_timeout" }, { status: 504 });
    }
    console.error("jd-generator/regenerate error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
