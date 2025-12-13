// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const protectedRoutes = ["/cart", "/orders", "/staff", "/owner"];
const authRoutes = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // 4. Redirect to /login if the user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Redirect to /menu if the user is authenticated and trying to access auth routes
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/menu", req.nextUrl));
  }

  // 6. Redirect home (/) to /menu if authenticated
  if (path === "/" && session?.userId) {
    return NextResponse.redirect(new URL("/menu", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
