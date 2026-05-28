import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  const t = cookies().get("token");
  // if (!t) return NextResponse.redirect(new URL("/login", request.url));
  // return NextResponse.redirect(new URL("/", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/test/:id*", "/dashboard", "/admin", "/test/attempt/:id*"],
};
