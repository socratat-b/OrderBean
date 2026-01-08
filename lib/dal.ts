// lib/dal.ts
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import "server-only";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId, role: session.role };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        barangay: true,
        street: true,
        landmark: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    // TODO: Use proper logging service in production (e.g., Sentry, Winston, Pino)
    console.error("Failed to fetch user:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
});

// Get current user without redirecting (for optional auth checks like Header)
export const getCurrentUser = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        barangay: true,
        street: true,
        landmark: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    // TODO: Use proper logging service in production (e.g., Sentry, Winston, Pino)
    console.error("Failed to fetch current user:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
});

// Get session without redirecting (for API routes)
export const getSession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  return { isAuth: true, userId: session.userId, role: session.role };
});
