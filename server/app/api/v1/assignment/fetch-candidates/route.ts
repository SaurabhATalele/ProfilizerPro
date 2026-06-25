import { NextRequest, NextResponse } from "next/server";
import { getTopNCandidates } from "@/Utils/api/Controllers/AssignmentController";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = await getTopNCandidates(body);
    return NextResponse.json({ data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error });
  }
}
