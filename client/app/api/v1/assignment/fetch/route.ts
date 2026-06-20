import { NextRequest, NextResponse } from "next/server";
import { getAssignmentById } from "@/Utils/api/Controllers/AssignmentController";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = await getAssignmentById(body);
    return data;
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
