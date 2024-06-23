import connectdb from "@/Utils/api/db/connectDB";
import { NextResponse } from "next/server";
import { verifyUser } from "@/Utils/api/Controllers/UserController";

export async function GET(req, res) {
  try {
    connectdb();
    const response = await verifyUser(req);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { Message: "Error in this route", error },
      { status: 500 },
    );
  }
}
