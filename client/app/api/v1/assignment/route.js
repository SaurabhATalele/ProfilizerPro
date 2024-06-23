import { NextResponse } from "next/server";
import connectdb from "@/Utils/api/db/connectDB";
import {
  createAssignment,
  getAssignments,
  updateScore,
  deleteAssignment,
} from "@/Utils/api/Controllers/AssignmentController.js";
import { updateAssignment } from "@/Utils/Apicalls/UpdateAssignment";

export async function GET(req, res) {
  try {
    const data = await getAssignments();
    return data;
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}

export async function POST(req, res) {
  try {
    const body = await req.json();
    const data = await createAssignment(body);
    return data;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error });
  }
}

export async function PATCH(req, res) {
  try {
    const body = await req.json();
    const data = await updateAssignment(body);
    return NextResponse.json({ message: data.message }, { status: data.status });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}

export async function PUT(req, res) {
  try {
    const body = await req.json();
    const data = await updateScore(body);
    return data;
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error });
  }
}

export async function DELETE(req, res) {
  try {
    const body = await req.json();
    const data = await deleteAssignment(body);
    return NextResponse.json({ message: data });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}
