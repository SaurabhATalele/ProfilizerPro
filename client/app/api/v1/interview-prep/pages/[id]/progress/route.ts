import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import { upsertProgress } from "@/Utils/api/Controllers/ProgressController";
import { ProgressUpdateSchema } from "@/Utils/validation/interviewPrepSchemas";

/**
 * POST /api/v1/interview-prep/pages/[id]/progress — upsert the caller's
 * progress status / notes. Any authenticated user.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    const pageId = (await params).id;
    const raw = await req.json();
    const parsed = ProgressUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    const userId = user.userId ?? user.email;
    const result = await upsertProgress(userId, pageId, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(
      { status: result.status, notes: result.notes },
      { status: 200 },
    );
  } catch (error) {
    console.error("interview-prep/pages/[id]/progress error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
