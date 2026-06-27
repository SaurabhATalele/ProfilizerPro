import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, requireAdmin } from "@/Utils/api/auth";
import { getPageBySlug, updatePage } from "@/Utils/api/Controllers/PageController";
import { PageUpdateSchema } from "@/Utils/validation/interviewPrepSchemas";

// This dynamic segment serves two callers with different param meanings:
//   GET  -> the value is a page SLUG (any authenticated reader)
//   PUT  -> the value is a page _id  (admin update)
// They coexist because slugs are kebab strings and ids are ObjectIds; the
// single Next dynamic param name keeps both at the same path level.

/**
 * GET /api/v1/interview-prep/pages/[slug] — full page detail incl. content,
 * increments view count, joins like/progress. Non-admins get 404 (never 403)
 * for draft/archived slugs.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    const slug = (await params).id;
    const result = await getPageBySlug(slug, {
      userId: user.userId,
      isAdmin: user.isAdmin === true,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("interview-prep/pages/[slug] GET error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

/**
 * PUT /api/v1/interview-prep/pages/[id] — update page content/metadata
 * (admin only).
 */
export async function PUT(
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
    const parsed = PageUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    const result = await updatePage(id, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ page: result.page }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/pages/[id] PUT error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
