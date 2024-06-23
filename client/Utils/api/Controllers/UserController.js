import User from "../Models/Users.js";
import { transporter } from "./AssignmentController.js";
import { NextResponse } from "next/server.js";
import { headers, cookies } from "next/headers";
import bcrypt from "bcryptjs";

const registerUser = async (body) => {
  try {
    const { email, password, username } = body;
    const isuser = await User.findOne({ email });
    if (isuser) {
      return NextResponse.json(
        { message: "User Already Exists" },
        { status: 400 },
      );
    }
    const user = await new User({ email, password, username });
    await user.save();
    return NextResponse.json(
      { message: "User Registered Successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    const message = error._message;

    return NextResponse.json({ message: message }, { status: 400 });
  }
};

const loginUser = async (body) => {
  try {
    console.log("Getting here");
    const email = body?.email;
    const password = body?.password;
    const data = await User.findOne({ email });
    if (!data) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }
    const isValid = await data.isValidPassword(password);
    // const isValid = await bcrypt.compare(password, data.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Incorrect Password" },
        { status: 403 },
      );
    }
    const token = await data.GenerateToken();
    cookies().set("token", token);
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
};

const sendEmail = async (email) => {
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

    return { status: 200, message: "Email Sent", otp: otp };
  } catch (error) {
    console.log(error);
  }
};

function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  let digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

const changePassword = async (body) => {
  try {
    const { email, password } = body;
    const data = await User.findOne({
      email,
    });
    if (!data) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    data.password = hashedPassword;
    await data.save();
    return NextResponse.json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.log(error);
  }
};

const verifyUser = async (req, res) => {
  try {
    const headersList = headers();
    console.log(headersList.get("authorization"));
    const type = headersList.get("authorization").split(" ")[0];
    let token = headersList.get("authorization").split(" ")[1];

    if (type !== "Bearer") {
      return NextResponse.json({ message: "Invalid Token" }, { status: 400 });
    }
    const data = await User.ValidateToken(token);
    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendEmail,
  verifyUser,
  changePassword,
};
