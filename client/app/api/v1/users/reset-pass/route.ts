import { NextRequest, NextResponse } from "next/server";
import { changePassword } from "@/Utils/api/Controllers/UserController";
import connectdb from "@/Utils/api/db/connectDB";
import mongoose from "mongoose";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    connectdb();
    const body = await req.json();
    const data = await changePassword(body);
    mongoose.connection.close();
    return (
      data || NextResponse.json({ message: "User Not Found" }, { status: 404 })
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
