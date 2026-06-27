import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/Utils/api/auth";
import { setPageStatus } from "@/Utils/api/Controllers/PageController";
import { PageStatusSchema } from "@/Utils/validation/interviewPrepSchemas";

/**
 * PATCH /api/v1/interview-prep/pages/[id]/status — publish / unpublish /
 * archive a page (admin only). Archiving preserves likes/progress rows.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const id = (await params).id;
    const raw = await req.json();
    const parsed = PageStatusSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    const result = await setPageStatus(id, parsed.data.status);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ page: result.page }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/pages/[id]/status error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
