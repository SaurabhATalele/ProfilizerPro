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
  otp?: string;
}

export interface UserData {
  isAdmin?: boolean;
  [key: string]: unknown;
}

function generateOTP(): string {
  // ponytail: 4-digit kept to match existing OTP inputs (numInputs={4}); 6-digit
  // would be stronger but changes the UI. Crypto-random instead of Math.random.
  return crypto.randomInt(0, 10000).toString().padStart(4, "0");
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
    const email = body?.email;
    const password = body?.password;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
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
    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
};

export const sendEmail = async (email: string): Promise<{ status: number; message: string }> => {
  try {
    if (typeof email !== "string" || !email) {
      return { status: 400, message: "Email is required" };
    }
    const data = await User.findOne({ email });
    if (!data) {
      return { status: 400, message: "User Not Found" };
    }
    const otp = generateOTP();
    // Store only the OTP hash in a short-lived HttpOnly cookie — never sent to the client.
    const token = jwt.sign(
      { email, otpHash: hashOtp(otp), purpose: "reset" },
      SECRET_KEY as string,
      { expiresIn: "10m" },
    );
    (await cookies()).set("reset_otp", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    const subject = "Reset your ProfilizePro password";
    const result = await deliverEmail({
      to: email,
      subject,
      react: EmailTemplate({ firstName: data.username, otp }),
    });
    if (!result.success) {
      return { status: 500, message: result.error || "Failed to send email" };
    }
    return { status: 200, message: "Email Sent" };
  } catch (error) {
    console.log(error);
    return { status: 500, message: "Something went wrong" };
  }
};

export const changePassword = async (body: ChangePasswordBody): Promise<NextResponse> => {
  try {
    const { email, password, otp } = body;
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Verify the reset OTP issued in the reset_otp cookie.
    const token = (await cookies()).get("reset_otp")?.value;
    if (!token || !otp) {
      return NextResponse.json(
        { message: "Verification required. Request a new code." },
        { status: 400 },
      );
    }
    let payload: { email?: string; otpHash?: string; purpose?: string };
    try {
      payload = jwt.verify(token, SECRET_KEY as string) as typeof payload;
    } catch {
      return NextResponse.json(
        { message: "Verification code expired. Request a new one." },
        { status: 400 },
      );
    }
    if (
      payload.purpose !== "reset" ||
      payload.email !== email ||
      payload.otpHash !== hashOtp(otp)
    ) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400 });
    }

    const data = await User.findOne({ email });
    if (!data) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }
    data.password = password;
    await data.save();
    (await cookies()).delete("reset_otp");
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
    const authHeader = headersList.get("authorization");
    if (!authHeader) {
      return { message: "Invalid Token" };
    }
    const type = authHeader.split(" ")[0];
    const token = authHeader.split(" ")[1];

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
