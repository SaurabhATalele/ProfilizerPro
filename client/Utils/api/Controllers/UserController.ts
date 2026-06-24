import User from "../Models/Users";
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { SECRET_KEY } from "@/Utils/constants";
import { sendEmail as deliverEmail } from "@/Utils/api/email";
import { EmailTemplate } from "@/Components/Otp/EmailTemplate";
import { nameSchema, usernameSchema } from "@/Utils/validation/profileSchemas";

interface RegisterBody {
  email: string;
  name:string;
  password: string;
  username: string;
  otp?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

interface ChangePasswordBody {
  email: string;
  password: string;
}

export interface UserData {
  isAdmin?: boolean;
  [key: string]: unknown;
}

function generateOTP(): string {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

const hashOtp = (otp: string): string =>
  crypto.createHash("sha256").update(otp).digest("hex");

// Email a verification code for a NEW registration. Stores only the OTP hash in
// a short-lived HttpOnly cookie (signed JWT) — no DB row, no plaintext to client.
export const sendRegistrationOtp = async (
  email: string,
): Promise<{ status: number; message: string }> => {
  if (!email) {
    return { status: 400, message: "Email is required" };
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return { status: 400, message: "User Already Exists" };
  }
  const otp = generateOTP();
  const token = jwt.sign(
    { email, otpHash: hashOtp(otp) },
    SECRET_KEY as string,
    { expiresIn: "10m" },
  );
  (await cookies()).set("reg_otp", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  const result = await deliverEmail({
    to: email,
    subject: "Verify your ProfilizePro email",
    react: EmailTemplate({ firstName: email.split("@")[0], otp }),
  });
  if (!result.success) {
    return { status: 500, message: result.error || "Failed to send email" };
  }
  return { status: 200, message: "Verification code sent" };
};

export const registerUser = async (body: RegisterBody): Promise<NextResponse> => {
  try {
    const { email, password, username, name, otp } = body;

    // Verify the email via the OTP issued in the reg_otp cookie.
    const token = (await cookies()).get("reg_otp")?.value;
    if (!token || !otp) {
      return NextResponse.json(
        { message: "Email not verified. Request a verification code." },
        { status: 400 },
      );
    }
    let payload: { email?: string; otpHash?: string };
    try {
      payload = jwt.verify(token, SECRET_KEY as string) as typeof payload;
    } catch {
      return NextResponse.json(
        { message: "Verification code expired. Request a new one." },
        { status: 400 },
      );
    }
    if (payload.email !== email || payload.otpHash !== hashOtp(otp)) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 },
      );
    }

    const isuser = await User.findOne({ email });
    if (isuser) {
      return NextResponse.json(
        { message: "User Already Exists" },
        { status: 400 },
      );
    }
    const user = new User({ email, password, username, name });
    await user.save();
    (await cookies()).delete("reg_otp");
    return NextResponse.json(
      { message: "User Registered Successfully" },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.log(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 400 });
  }
};

export const loginUser = async (body: LoginBody): Promise<NextResponse> => {
  try {
    console.log("Getting here");
    const email = body?.email;
    const password = body?.password;
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }
    const data = await User.findOne({ email });
    if (!data) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }
    const isValid = await data.isValidPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Incorrect Password" },
        { status: 403 },
      );
    }
    const token = await data.GenerateToken();
    if (!token) {
      return NextResponse.json({ message: "Token generation failed" }, { status: 500 });
    }
    (await cookies()).set("token", token);
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
};

export const sendEmail = async (email: string): Promise<{ status: number; message: string; otp?: string }> => {
  try {
    console.log(email);
    const data = await User.findOne({ email });
    if (!data) {
      return { status: 400, message: "User Not Found" };
    }
    const otp = generateOTP();
    console.log("otp is", otp);
    const subject = "Reset your ProfilizePro password";
    const result = await deliverEmail({
      to: email,
      subject,
      react: EmailTemplate({ firstName: data.username, otp }),
    });
    if (!result.success) {
      return { status: 500, message: result.error || "Failed to send email" };
    }

    return { status: 200, message: "Email Sent", otp };
  } catch (error) {
    console.log(error);
    return { status: 500, message: "Something went wrong" };
  }
};

export const changePassword = async (body: ChangePasswordBody): Promise<NextResponse> => {
  try {
    const { email, password } = body;
    const data = await User.findOne({ email });
    if (!data) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }
    data.password = password;
    await data.save();
    return NextResponse.json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
};

export const changeUserPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<NextResponse> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }

    const isValid = await user.isValidPassword(oldPassword);
    if (!isValid) {
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 403 }
      );
    }

    if (newPassword === oldPassword) {
      return NextResponse.json(
        { message: "New password must be different from current password" },
        { status: 400 }
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
};

export const verifyUser = async (..._args: unknown[]): Promise<UserData> => {
  try {
    const headersList = await headers();
    console.log(headersList.get("authorization"));
    const type = headersList.get("authorization")!.split(" ")[0];
    const token = headersList.get("authorization")!.split(" ")[1];

    if (type !== "Bearer") {
      return { message: "Invalid Token" };
    }
    const data = await User.ValidateToken(token);
    
    return data as UserData;
  } catch (error) {
    console.log(error);
    return { message: "Error" };
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; username?: string }
): Promise<NextResponse> => {
  try {
    const updateObj: Record<string, string> = {};

    if (updates.name !== undefined) {
      const nameResult = nameSchema.safeParse(updates.name);
      if (!nameResult.success) {
        return NextResponse.json(
          { message: nameResult.error.errors[0].message, field: "name" },
          { status: 400 }
        );
      }
      updateObj.name = nameResult.data;
    }

    if (updates.username !== undefined) {
      const usernameResult = usernameSchema.safeParse(updates.username);
      if (!usernameResult.success) {
        return NextResponse.json(
          { message: usernameResult.error.errors[0].message, field: "username" },
          { status: 400 }
        );
      }
      const trimmedUsername = usernameResult.data;

      const existing = await User.findOne({
        username: { $regex: new RegExp(`^${trimmedUsername}$`, "i") },
        _id: { $ne: userId },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Username is already taken" },
          { status: 409 }
        );
      }
      updateObj.username = trimmedUsername;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateObj, { new: true }).select("-password");
    return NextResponse.json(
      { message: "Profile updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
};
