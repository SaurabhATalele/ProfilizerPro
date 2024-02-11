import { NextResponse } from "next/server";

export function GET(req, res) {
  try {
    return NextResponse.json({ message: "Hello next" });
  } catch (error) {
    console.log("Jbsbc");
  }
}
