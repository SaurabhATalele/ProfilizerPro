import { sendEmail } from "@/Utils/api/Controllers/UserController";
import { NextRequest, NextResponse } from "next/server";
import connectdb from "@/Utils/api/db/connectDB";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    connectdb();
    const { email } = await req.json();
    const data = await sendEmail(email);
    console.log("POST generate-otp data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ Message: "Error in this route" });
  }
}
