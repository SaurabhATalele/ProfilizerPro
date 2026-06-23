import { NextRequest, NextResponse } from "next/server";
import { generateTest } from "@/Utils/api/Controllers/GenerateTestController";

interface GenerateBody {
  prompt: {
    topic: string;
    questions: string;
    // easy | medium | hard; normalized in the controller (defaults to "medium")
    difficulty?: string;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as GenerateBody;

    if (!body?.prompt?.topic || !body?.prompt?.questions) {
      return NextResponse.json(
        { message: "Missing 'prompt.topic' or 'prompt.questions'" },
        { status: 400 },
      );
    }

    const response = await generateTest(body.prompt);
    return NextResponse.json({ response }, { status: 200 });
  } catch (error: unknown) {
    console.error("generate-test error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate test";
    return NextResponse.json({ message }, { status: 500 });
  }
}
