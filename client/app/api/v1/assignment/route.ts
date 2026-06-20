import { NextRequest, NextResponse } from "next/server";
import {
  createAssignment,
  getAssignments,
  updateScore,
  deleteAssignment,
} from "@/Utils/api/Controllers/AssignmentController";
import { updateAssignment } from "@/Utils/Apicalls/UpdateAssignment";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const data = await getAssignments();
    return data;
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = await createAssignment(body);
    return data;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = await updateAssignment(body);
    return NextResponse.json({ message: data.message }, { status: data.status });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = await updateScore(body);
    return data;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = await deleteAssignment(body);
    return NextResponse.json({ message: data });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}
