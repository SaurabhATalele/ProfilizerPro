import User from "../Models/Users";
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import bcrypt from "bcryptjs";
import nodeMailer from "nodemailer";

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASS_KEY,
  },
});

interface RegisterBody {
  email: string;
  password: string;
  username: string;
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

export const registerUser = async (body: RegisterBody): Promise<NextResponse> => {
  try {
    const { email, password, username } = body;
    const isuser = await User.findOne({ email });
    if (isuser) {
      return NextResponse.json(
        { message: "User Already Exists" },
        { status: 400 },
      );
    }
    const user = new User({ email, password, username });
    await user.save();
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
    const subject = "password reset";
    const text = `We have received your password reset request. Please find Your otp here:</br> ${otp}`;
    const mailOptions = {
      from: "saurabhatalele@gmail.com",
      to: email,
      subject: subject,
      html: text,
    };
    await transporter.sendMail(mailOptions);

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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    data.password = hashedPassword;
    await data.save();
    return NextResponse.json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
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
