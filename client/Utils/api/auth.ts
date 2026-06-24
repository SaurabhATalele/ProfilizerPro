import { headers, cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/Utils/constants";

export interface AuthUser {
  userId?: string;
  email: string;
  username?: string;
  isAdmin?: boolean;
}

/**
 * Resolve the authenticated user from the request. Accepts a JWT in the
 * Authorization header ("Bearer <t>" or raw) and falls back to the `token`
 * cookie. Returns null when missing/invalid — never throws.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const h = await headers();
    const auth = h.get("authorization") || "";
    let token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : auth.trim();
    if (!token) {
      token = (await cookies()).get("token")?.value || "";
    }
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET_KEY as string) as AuthUser;
    return decoded && typeof decoded.email === "string" ? decoded : null;
  } catch {
    return null;
  }
}

/** Returns the user only if authenticated AND an admin, else null. */
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  return user && user.isAdmin === true ? user : null;
}
