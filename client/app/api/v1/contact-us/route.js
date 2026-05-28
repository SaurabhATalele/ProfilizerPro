import { NextResponse } from "next/server";
import sendMail from "@/Utils/api/Controllers/Common";

export async function POST(req, res) {
  try {
    const body = await req.json();
    const response = await sendMail(body);
    return NextResponse.json(response, { status: 200 });
    }
    catch (error) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
}

    