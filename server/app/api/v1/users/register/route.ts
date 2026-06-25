import { registerUser } from "@/Utils/api/Controllers/UserController";
import connectdb from "@/Utils/api/db/connectDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    connectdb();
    const body = await req.json();
    const response = await registerUser(body);
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
