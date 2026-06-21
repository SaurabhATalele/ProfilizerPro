import connectdb from "@/Utils/api/db/connectDB";
import { NextRequest, NextResponse } from "next/server";
import { verifyUser, updateUserProfile, changeUserPassword } from "@/Utils/api/Controllers/UserController";
import User from "@/Utils/api/Models/Users";

export async function GET(req: NextRequest): Promise<NextResponse> {
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

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    connectdb();

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const [type, token] = authorization.split(" ");
    if (type !== "Bearer" || !token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = await  User.ValidateToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { userId } = decoded as { userId: string; email: string; username: string; isAdmin: boolean };

    const body = await req.json();
    const { action } = body;

    if (action === "updateProfile") {
      const { name, username } = body;
      return await updateUserProfile(userId, { name, username });
    } else if (action === "changePassword") {
      const { oldPassword, newPassword } = body;
      return await changeUserPassword(userId, oldPassword, newPassword);
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
