import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:4000";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  // Build the target URL on the backend
  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  // Forward headers from the original request
  const headers = new Headers(request.headers);
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.delete("host");

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      // @ts-expect-error duplex is required for streaming body but not in all TS types
      duplex: "half",
    });

    // Create response with backend's body and status
    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Copy response headers from backend
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        response.headers.set(key, value);
      }
    });

    return response;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Backend service unavailable" },
      { status: 502 }
    );
  }
}

export const config = {
  matcher: "/api/v1/:path*",
};
