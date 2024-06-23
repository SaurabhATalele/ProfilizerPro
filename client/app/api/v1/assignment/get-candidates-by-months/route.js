import { NextResponse } from "next/server";
import { getCandidatesByMonths } from "@/Utils/api/Controllers/AssignmentController";
import { verifyUser } from "@/Utils/api/Controllers/UserController";

export async function GET(req, res) {
  try {
    const token = req.headers.authorization;
    // Verify if the user is admin based on the token
    const user = await verifyUser();
    if (!user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const data = await getCandidatesByMonths();

    return NextResponse.json({ message: data }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
