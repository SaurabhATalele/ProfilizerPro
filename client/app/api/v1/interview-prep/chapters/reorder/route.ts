import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/Utils/api/auth";
import { reorderChapters } from "@/Utils/api/Controllers/ChapterController";
import { ReorderSchema } from "@/Utils/validation/interviewPrepSchemas";

/**
 * PATCH /api/v1/interview-prep/chapters/reorder — reorder chapters within a
 * subject (admin only). Body: `{ items: [{ _id, order }] }`.
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const parsed = ReorderSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    await reorderChapters(parsed.data.items);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/chapters/reorder error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
