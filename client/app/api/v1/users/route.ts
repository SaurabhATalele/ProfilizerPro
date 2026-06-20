import { NextRequest, NextResponse } from "next/server";

export function GET(_req: NextRequest): NextResponse {
  try {
    return NextResponse.json({ message: "Hello next" });
  } catch (error) {
    console.log("Jbsbc");
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
