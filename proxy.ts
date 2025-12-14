// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const protectedRoutes = ["/orders", "/staff", "/owner"];
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

  // 3.1. If cookie exists but session is invalid, clear the cookie
  if (cookie && !session?.userId) {
    if (isProtectedRoute) {
      // Add redirect callback URL
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("redirect", path);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("session");
      return response;
    }

    const response = NextResponse.next();
    response.cookies.delete("session");
    return response;
  }

  // 4. Redirect to /login if the user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session?.userId) {
    // Add redirect callback URL
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Redirect to /menu if the user is authenticated and trying to access auth routes
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/menu", req.nextUrl));
  }

  // 6. Redirect home (/) based on user role
  if (path === "/" && session?.userId) {
    if (session.role === "STAFF") {
      return NextResponse.redirect(new URL("/staff", req.nextUrl));
    } else if (session.role === "OWNER") {
      return NextResponse.redirect(new URL("/owner", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/menu", req.nextUrl));
    }
  }

  // 7. Redirect staff/owner away from customer-only routes
  const customerOnlyRoutes = ["/menu", "/cart", "/orders"];
  const isCustomerOnlyRoute = customerOnlyRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isCustomerOnlyRoute && session?.userId) {
    if (session.role === "STAFF") {
      return NextResponse.redirect(new URL("/staff", req.nextUrl));
    } else if (session.role === "OWNER") {
      return NextResponse.redirect(new URL("/owner", req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
