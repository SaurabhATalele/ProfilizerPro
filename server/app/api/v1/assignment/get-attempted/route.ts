import { NextRequest, NextResponse } from "next/server";
import { getAttemptedAssignments } from "@/Utils/api/Controllers/AssignmentController";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("data:");
    const data = await getAttemptedAssignments(req);
    return NextResponse.json({ data: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error in this route", error },
      { status: 500 },
    );
  }
}
