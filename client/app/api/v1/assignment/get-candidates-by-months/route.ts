import { NextRequest, NextResponse } from "next/server";
import { getCandidatesByMonths } from "@/Utils/api/Controllers/AssignmentController";
import { UserData, verifyUser } from "@/Utils/api/Controllers/UserController";


export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const user: UserData = await verifyUser();
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
