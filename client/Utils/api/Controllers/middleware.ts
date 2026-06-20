import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../constants";
import { NextRequest, NextResponse } from "next/server";

interface VerifiedRequest extends NextRequest {
  user?: unknown;
}

export const verifyToken = async (
  req: VerifiedRequest,
  _res: unknown,
  next: () => void,
): Promise<NextResponse | void> => {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }
  try {
    const verified = jwt.verify(token, SECRET_KEY as string);
    req.user = verified;
    next();
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }
};
