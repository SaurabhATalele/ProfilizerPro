import { NextResponse } from "next/server";
import connectdb from "@/Utils/api/db/connectDB";
import {
  createAssignment,
  getAssignments,
  updateScore,
} from "@/Utils/api/Controllers/AssignmentController.js";

export async function GET(req, res) {
  try {
    connectdb();
    const data = await getAssignments();
    return data;
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}

export async function POST(req, res) {
  try {
    connectdb();
    const body = await req.json();
    console.log(body.name);
    const data = await createAssignment(body);
    return data;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error });
  }
}

export async function PUT(req, res) {
  try {
    connectdb();
    const body = await req.json();
    console.log(body);
    const data = await updateScore(body);
    return data;
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}
