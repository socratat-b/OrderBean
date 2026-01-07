// actions/auth.ts
"use server";

import { FormState, LoginFormSchema, SignupFormSchema, ChangePasswordFormSchema } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Prepare data for insertion into database
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      message: "Email already exists. Please use a different email or login.",
    };
  }

  // 4. Insert the user into the database
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER", // Default role
      },
    });

    if (!user) {
      return {
        message: "An error occurred while creating your account.",
      };
    }

    // 5. Create user session
    await createSession(user.id, user.role);
  } catch (error) {
    return {
      message: "An error occurred while creating your account.",
    };
  }

  // 6. Get redirect parameter (if provided)
  const redirectTo = formData.get("redirect") as string | null;

  // 7. Redirect based on role (staff/owner) or redirect callback (customer)
  if (user.role === "STAFF") {
    redirect("/staff");
  } else if (user.role === "OWNER") {
    redirect("/owner");
  } else {
    // For customers, use redirect callback if provided, otherwise default to /menu
    redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/menu");
  }
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Query the database for the user
  const { email, password } = validatedFields.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message: "Invalid email or password.",
    };
  }

  // 3. Compare the password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return {
      message: "Invalid email or password.",
    };
  }

  // 4. Create user session
  await createSession(user.id, user.role);

  // 5. Get redirect parameter (if provided)
  const redirectTo = formData.get("redirect") as string | null;

  // 6. Redirect based on role (staff/owner) or redirect callback (customer)
  if (user.role === "STAFF") {
    redirect("/staff");
  } else if (user.role === "OWNER") {
    redirect("/owner");
  } else {
    // For customers, use redirect callback if provided, otherwise default to /menu
    redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/menu");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function changePassword(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Verify user is authenticated
  const session = await getSession();
  if (!session) {
    return {
      message: "You must be logged in to change your password.",
    };
  }

  // 2. Validate form fields
  const validatedFields = ChangePasswordFormSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  // 3. Get user from database
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return {
      message: "User not found.",
    };
  }

  // 4. Verify current password
  const passwordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatch) {
    return {
      message: "Current password is incorrect.",
    };
  }

  // 5. Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 6. Update password in database
  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: "Password changed successfully!",
    };
  } catch (error) {
    return {
      message: "An error occurred while changing your password.",
    };
  }
}
