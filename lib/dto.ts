// lib/dto.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";

/**
 * DTOs (Data Transfer Objects) control what data is exposed based on viewer permissions
 * Following Next.js authentication guide best practices
 */

// User DTO - returns only safe user data based on viewer role
export async function getUserDTO(targetUserId: string) {
  const session = await getSession();

  // Get the target user
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    return null;
  }

  // All authenticated users can see basic info
  const baseData = {
    id: user.id,
    name: user.name,
  };

  // Only the user themselves, staff, or owners can see email
  const canSeeEmail =
    session?.userId === targetUserId ||
    session?.role === "STAFF" ||
    session?.role === "OWNER";

  // Only staff and owners can see role
  const canSeeRole = session?.role === "STAFF" || session?.role === "OWNER";

  return {
    ...baseData,
    email: canSeeEmail ? user.email : null,
    role: canSeeRole ? user.role : null,
  };
}

// Order DTO - returns order data based on viewer permissions
export async function getOrderDTO(orderId: string) {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  // Check authorization
  const isOwner = order.userId === session.userId;
  const isStaffOrOwner = session.role === "STAFF" || session.role === "OWNER";

  // Customers can only see their own orders
  if (!isOwner && !isStaffOrOwner) {
    return null;
  }

  // Staff and owners get full customer details
  if (isStaffOrOwner) {
    return order;
  }

  // Customers see limited data (no other customer info)
  return {
    id: order.id,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    orderItems: order.orderItems,
    // Don't expose full user object for customers viewing their own orders
    user: {
      id: order.user.id,
      name: order.user.name,
    },
  };
}

// Profile DTO - returns user profile based on viewer permissions
export async function getProfileDTO(targetUserId: string) {
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  // Users can see their own full profile
  const isOwnProfile = session?.userId === targetUserId;

  // Staff and owners can see all profiles
  const isStaffOrOwner = session?.role === "STAFF" || session?.role === "OWNER";

  if (isOwnProfile || isStaffOrOwner) {
    return user;
  }

  // Others see limited public data
  return {
    id: user.id,
    name: user.name,
  };
}

// Analytics DTO - returns analytics based on viewer role
export async function canAccessAnalytics() {
  const session = await getSession();

  // Only owners can access analytics
  return session?.role === "OWNER";
}

// Product management DTO - check if user can manage products
export async function canManageProducts() {
  const session = await getSession();

  // Only owners can manage products
  return session?.role === "OWNER";
}

// Order management DTO - check if user can manage orders
export async function canManageOrders() {
  const session = await getSession();

  // Staff and owners can manage orders
  return session?.role === "STAFF" || session?.role === "OWNER";
}
