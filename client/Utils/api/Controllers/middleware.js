import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../constants";
import User from "../Models/user";
import NextResponse from "next-response";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }
};
