import { loginUser } from "@/Utils/api/Controllers/UserController";
import connectdb from "@/Utils/api/db/connectDB";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const body = await req.json();
    const response = await loginUser(body);
    return response;
  } catch (error) {
    return NextResponse.json({ Message: "Error in this route" });
  }
}
