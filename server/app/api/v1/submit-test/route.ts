import { NextRequest, NextResponse } from "next/server";
import { gradeTestSession } from "@/Utils/api/Controllers/TestSessionController";
import { getAuthUser } from "@/Utils/api/auth";
import connectdb from "@/Utils/api/db/connectDB";

interface SubmitBody {
  sessionId: string;
  answers: Record<string, string>; // question index -> selected option
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    connectdb();
    const { sessionId, answers } = (await req.json()) as SubmitBody;
    const result = await gradeTestSession(user.email, sessionId, answers || {});
    if (result.status !== 200) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    return NextResponse.json(
      { score: result.score, total: result.total },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
