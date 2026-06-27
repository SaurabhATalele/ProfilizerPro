import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import { toggleLike } from "@/Utils/api/Controllers/ProgressController";

/**
 * POST /api/v1/interview-prep/pages/[id]/like — toggle the caller's like.
 * Any authenticated user. Returns `{ liked, likeCount }`.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    const pageId = (await params).id;
    const userId = user.userId ?? user.email;
    const result = await toggleLike(userId, pageId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("interview-prep/pages/[id]/like error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
