import { NextResponse } from "next/server";

export function middleware(): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: ["/test/:id*", "/dashboard", "/admin", "/test/attempt/:id*"],
};
