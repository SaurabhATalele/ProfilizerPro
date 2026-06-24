import { sendRegistrationOtp } from "@/Utils/api/Controllers/UserController";
import connectdb from "@/Utils/api/db/connectDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    connectdb();
    const { email } = await req.json();
    const data = await sendRegistrationOtp(email);
    return NextResponse.json({ message: data.message }, { status: data.status });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
