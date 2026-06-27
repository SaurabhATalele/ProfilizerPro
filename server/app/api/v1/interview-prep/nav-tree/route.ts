import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import { getNavTree } from "@/Utils/api/Controllers/SubjectController";

/**
 * GET /api/v1/interview-prep/nav-tree
 *
 * Returns the full Subject -> Chapter -> Page tree (titles/slugs/icons only,
 * no content bodies) plus the published note total for the sidebar. Any
 * authenticated user; non-admins see published pages only.
 */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    const tree = await getNavTree(user.isAdmin === true);
    return NextResponse.json(tree, { status: 200 });
  } catch (error) {
    console.error("interview-prep/nav-tree error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
