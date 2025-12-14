// actions/auth.ts
"use server";

import { FormState, LoginFormSchema, SignupFormSchema } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

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
  try {
    const user = await prisma.user.create({
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

    // 6. Redirect based on role
    if (user.role === "STAFF") {
      redirect("/staff");
    } else if (user.role === "OWNER") {
      redirect("/owner");
    } else {
      redirect("/menu");
    }
  } catch (error) {
    return {
      message: "An error occurred while creating your account.",
    };
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

  // 5. Redirect based on role
  if (user.role === "STAFF") {
    redirect("/staff");
  } else if (user.role === "OWNER") {
    redirect("/owner");
  } else {
    redirect("/menu");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
