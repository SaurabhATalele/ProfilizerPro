import { NextRequest, NextResponse } from "next/server";
import sendMail from "@/Utils/api/Controllers/Common";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const response = await sendMail(body);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 404 });
  }
}
