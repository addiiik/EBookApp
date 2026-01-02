"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignInSchema, SignUpSchema, SignInFormData, SignUpFormData } from "@/schemas/auth";
import { AuthTokenPayload } from "@/types/auth";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signInAction(formData: SignInFormData) {
  const parsed = SignInSchema.safeParse(formData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue?.message ?? "Invalid input";

    return {
      success: false,
      message,
    };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return { success: false, message: "Invalid email or password" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { success: false, message: "Invalid email or password" };

  await storeUserToken(user.id);

  return { success: true, message: "Signed in successfully" };
}

export async function signUpAction(formData: SignUpFormData) {
  const parsed = SignUpSchema.safeParse(formData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue?.message ?? "Invalid input";

    return {
      success: false,
      message,
    };
  }

  const { name, email, password, confirmPassword } = parsed.data;

  if (password != confirmPassword) {
    return { success: false, message: "Passwords do not match" };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return { success: false, message: "Email is already used" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  await storeUserToken(user.id);

  return { success: true, message: "Account created successfully!" };
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  return { success: true, message: "Signed out successfully" };
}

export async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}

async function storeUserToken(userId: string){
  const token = await new SignJWT({
    id: userId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
