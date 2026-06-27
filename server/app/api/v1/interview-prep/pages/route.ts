import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/Utils/api/auth";
import { createPage } from "@/Utils/api/Controllers/PageController";
import { PageCreateSchema } from "@/Utils/validation/interviewPrepSchemas";

/**
 * POST /api/v1/interview-prep/pages — create a page (admin only).
 *
 * Auto-generates a globally-unique slug from the title when none is supplied.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const raw = await req.json();
    const parsed = PageCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    const userId = admin.userId ?? admin.email;
    const result = await createPage(parsed.data, userId);
    return NextResponse.json({ page: result.page }, { status: 201 });
  } catch (error) {
    console.error("interview-prep/pages POST error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
