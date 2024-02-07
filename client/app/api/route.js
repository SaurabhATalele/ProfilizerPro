import { NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    const body = req.body.name;
    return NextResponse.json({ message: "HEllo world" });
    res.status(200), json({ message: `Hello ${body}` });
  } catch (error) {
    console.log("Hello error");
  }
}
