// proxy.ts
import { verifyToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // ✅ Get token from Authorization HEADER
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { error: "Token expired or invalid. Please login again." },
      { status: 401 },
    );
  }

  // Token valid! Add user info to REQUEST headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", decoded.userId);
  requestHeaders.set("x-user-email", decoded.email);
  requestHeaders.set("x-user-role", decoded.role);

  // Continue to route with user info
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Protect these coffee shop routes
export const config = {
  matcher: [
    "/api/orders/:path*", // Customer orders
    "/api/profile/:path*", // Customer profile
    "/api/staff/:path*", // Staff dashboard
  ],
};
