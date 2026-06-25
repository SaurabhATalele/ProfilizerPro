import { NextRequest, NextResponse } from "next/server";
import {
  createAssignment,
  getAssignments,
  updateScore,
  deleteAssignment,
} from "@/Utils/api/Controllers/AssignmentController";
import { updateAssignment } from "@/Utils/Apicalls/UpdateAssignment";
import { getAuthUser, requireAdmin } from "@/Utils/api/auth";

// Public read of (non-custom) assignments.
export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const data = await getAssignments();
    return data;
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// Admin-only: create an assignment.
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const data = await createAssignment(body);
    return data;
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// Admin-only: edit an assignment.
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const data = await updateAssignment(body);
    return NextResponse.json({ message: data.message }, { status: data.status });
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// Record an attempt. Auth required; owner identity comes from the JWT, never the body.
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = await updateScore({ ...body, email: user.email });
    return data;
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// Admin-only: delete an assignment.
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const data = await deleteAssignment(body);
    return NextResponse.json({ message: data });
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
