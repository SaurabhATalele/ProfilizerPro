import { NextRequest, NextResponse } from "next/server";
import { createTestSession } from "@/Utils/api/Controllers/TestSessionController";
import { getAuthUser } from "@/Utils/api/auth";
import connectdb from "@/Utils/api/db/connectDB";

interface GenerateBody {
  prompt: {
    topic: string;
    questions: string;
    difficulty?: string; // easy | medium | hard; normalized in the controller
  };
  context?: {
    mode: "assignment" | "custom";
    assignmentId?: string;
    customAssignmentId?: string;
    topic?: string;
    difficulty?: string;
    subtopics?: { name: string; questionCount: number }[];
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    connectdb();
    const body = (await req.json()) as GenerateBody;

    if (!body?.prompt?.topic || !body?.prompt?.questions) {
      return NextResponse.json(
        { message: "Missing 'prompt.topic' or 'prompt.questions'" },
        { status: 400 },
      );
    }
    const mode = body.context?.mode;
    if (mode !== "assignment" && mode !== "custom") {
      return NextResponse.json({ message: "Invalid context" }, { status: 400 });
    }

    // Returns { id, questions:[{question, options}] } — answers stay server-side.
    const data = await createTestSession(user.email, body.prompt, body.context!);
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("generate-test error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate test";
    return NextResponse.json({ message }, { status: 500 });
  }
}
