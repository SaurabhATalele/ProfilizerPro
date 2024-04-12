import { NextResponse } from "next/server";
import { getAttemptedAssignments } from "@/Utils/api/Controllers/AssignmentController.js";

export async function GET(req, res) {
  try {
    const data = await getAttemptedAssignments(req);
    return NextResponse.json({ data: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}
// export async function POST(req, res) {
