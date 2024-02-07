import User from "../Models/Users.js";
import { transporter } from "./AssignmentController.js";
import { NextResponse } from "next/server.js";

const registerUser = async (body) => {
  try {
    const { email, password, name } = body;
    const user = await new User({ email, password, name });
    await user.save();
    return NextResponse.json(
      { message: "User Registered Successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    const message = error._message;
    return NextResponse.json({ message: message }, { status: 400 });
  }
};

const loginUser = async (body) => {
  try {
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
        { status: 403 }
      );
    }
    const token = await data.GenerateToken();
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
};

const sendEmail = async (req, res) => {
  try {
    const email = req.body?.email;
    const data = await User.findOne({ email });
    if (!data) {
      res.status(404).json({ message: "User Not Found" });
    }
    const otp = generateOTP();
    const subject = "password reset";
    const text = `We have received your password reset request. Please find Your otp here:</br> ${otp}`;
    const mailOptions = {
      from: "saurabhatalele@gmail.com",
      to: email,
      subject: subject,
      html: text,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: `otp is ${otp}`,
    });
  } catch (error) {}
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
module.exports = { registerUser, loginUser, sendEmail };
