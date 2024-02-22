import { sendEmail } from "@/Utils/api/Controllers/UserController";
import { NextResponse } from "next/server";
import connectdb from "@/Utils/api/db/connectDB";

export async function POST(req, res) {
  try {
    connectdb();
    const email = await req.json();
    const data = await sendEmail(email);
    console.log("🚀 ~ file: route.js ~ line 11 ~ POST ~ data", data);
    return data;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ Message: "Error in this route" });
  }
}
