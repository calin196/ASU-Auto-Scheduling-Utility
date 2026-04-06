"use client";

import Link from "next/link";
import { useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { loginUser } from "./actions";

type Errors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("loginEmail") || "").trim();
    const password = String(formData.get("loginPassword") || "");

    const nextErrors: Errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      e.preventDefault();
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Sign in to your ASU account.</p>

        <form
          action={loginUser}
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
          className="auth-form"
        >
          <input
            type="text"
            name="fake-username"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />
          <input
            type="password"
            name="fake-password"
            autoComplete="current-password"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />

          <div className="form-group">
            <label htmlFor="loginEmail" className="form-label">
              Email
            </label>
            <input
              id="loginEmail"
              name="loginEmail"
              type="email"
              defaultValue=""
              autoComplete="off"
              className={`form-input ${errors.email ? "input-invalid" : ""}`}
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword" className="form-label">
              Password
            </label>
            <input
              id="loginPassword"
              name="loginPassword"
              type="password"
              defaultValue=""
              autoComplete="new-password"
              className={`form-input ${errors.password ? "input-invalid" : ""}`}
            />
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <SubmitButton>Login</SubmitButton>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}