import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import { searchPages } from "@/Utils/api/Controllers/PageController";

/**
 * GET /api/v1/interview-prep/pages/search?q=...
 *
 * Case-insensitive search over page title/tags. Any authenticated user;
 * non-admins see published pages only.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    const q = req.nextUrl.searchParams.get("q") ?? "";
    const results = await searchPages(q, user.isAdmin === true);
    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/pages/search error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
