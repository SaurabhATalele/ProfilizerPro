import { NextRequest, NextResponse } from "next/server";
import { suggestSubtopics } from "@/Utils/api/Controllers/SuggestSubtopicsController";

interface SuggestBody {
  topic: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as SuggestBody;
    if (!body?.topic || body.topic.trim().length === 0) {
      return NextResponse.json({ message: "Missing 'topic'" }, { status: 400 });
    }
    const subtopics = await suggestSubtopics(body.topic);
    return NextResponse.json({ subtopics }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to suggest subtopics";
    return NextResponse.json({ message }, { status: 500 });
  }
}
