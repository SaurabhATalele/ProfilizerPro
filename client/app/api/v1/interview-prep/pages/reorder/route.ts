import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/Utils/api/auth";
import { reorderPagesInChapter } from "@/Utils/api/Controllers/PageController";
import { ReorderSchema } from "@/Utils/validation/interviewPrepSchemas";

/**
 * PATCH /api/v1/interview-prep/pages/reorder — reorder pages within a chapter
 * (admin only). Body: `{ items: [{ _id, order }] }`.
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const raw = await req.json();
    const parsed = ReorderSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    await reorderPagesInChapter(parsed.data.items);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/pages/reorder error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
