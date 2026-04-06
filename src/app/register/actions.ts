"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function registerUser(formData: FormData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("registerEmail") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("registerPassword") || "");
  const role = Number(formData.get("role"));

  if (fullName.length < 2) {
    redirect("/register");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    redirect("/register");
  }

  if (password.length < 6) {
    redirect("/register");
  }

  if (role !== 0 && role !== 1) {
    redirect("/register");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      role,
    },
  });

  redirect("/login");
}