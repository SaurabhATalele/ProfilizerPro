import { NextResponse } from "next/server";

import connectdb from "@/Utils/api/db/connectDB";
import { getTopNCandidates } from "@/Utils/api/Controllers/AssignmentController.js";

export async function POST(req, res) {
  try {
    const body = await req.json();
    const data = await getTopNCandidates(body);
    return NextResponse.json({ data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error });
  }
}
