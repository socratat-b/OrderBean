import { getSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only customers can update their profile
    if (session.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "This feature is only available for customers" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, phone } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name is required and must be a non-empty string" },
          { status: 400 }
        );
      }

      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters long" },
          { status: 400 }
        );
      }

      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: "Name must be less than 100 characters" },
          { status: 400 }
        );
      }
    }

    // Validate phone if provided
    if (phone !== undefined && phone !== null) {
      if (typeof phone !== "string") {
        return NextResponse.json(
          { error: "Phone must be a string" },
          { status: 400 }
        );
      }

      const trimmedPhone = phone.trim();

      // Allow empty string to clear phone
      if (trimmedPhone.length > 0) {
        // Basic phone validation (10-15 digits, optional + and spaces/dashes)
        const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
        if (!phoneRegex.test(trimmedPhone)) {
          return NextResponse.json(
            { error: "Please enter a valid phone number" },
            { status: 400 }
          );
        }
      }
    }

    // Build update data object
    const updateData: { name?: string; phone?: string | null } = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone === null || phone.trim() === "" ? null : phone.trim();
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
