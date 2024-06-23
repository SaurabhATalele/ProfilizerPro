import { NextResponse } from "next/server";
import connectdb from "@/Utils/api/db/connectDB";
import { getAssignmentById } from "@/Utils/api/Controllers/AssignmentController.js";

export async function POST(req, res) {
  try {
    const body = await req.json();
    const data = await getAssignmentById(body);
    return data;
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
  //   return NextResponse.json({ message: "Hello" });
}
