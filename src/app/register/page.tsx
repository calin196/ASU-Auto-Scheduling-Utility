"use client";

import Link from "next/link";
import { useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { registerUser } from "./actions";

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
};

export default function RegisterPage() {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const formData = new FormData(form);

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("registerEmail") || "").trim();
    const password = String(formData.get("registerPassword") || "");
    const role = String(formData.get("role") || "");

    const nextErrors: Errors = {};

    if (fullName.length < 2) {
      nextErrors.fullName = "Full name must be at least 2 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (role !== "0" && role !== "1") {
      nextErrors.role = "Please select an account type.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      e.preventDefault();
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Register</h1>
        <p className="auth-subtitle">Create a client or business account.</p>

        <form
          action={registerUser}
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
            autoComplete="new-password"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />

          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue=""
              autoComplete="off"
              className={`form-input ${errors.fullName ? "input-invalid" : ""}`}
            />
            {errors.fullName && (
              <div className="field-error">{errors.fullName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="registerEmail" className="form-label">
              Email
            </label>
            <input
              id="registerEmail"
              name="registerEmail"
              type="email"
              defaultValue=""
              autoComplete="off"
              className={`form-input ${errors.email ? "input-invalid" : ""}`}
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="registerPassword" className="form-label">
              Password
            </label>
            <input
              id="registerPassword"
              name="registerPassword"
              type="password"
              defaultValue=""
              autoComplete="new-password"
              className={`form-input ${errors.password ? "input-invalid" : ""}`}
            />
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Account type
            </label>
            <select
              id="role"
              name="role"
              defaultValue=""
              className={`form-select ${errors.role ? "input-invalid" : ""}`}
            >
              <option value="" disabled>
                Select account type
              </option>
              <option value="0">Client</option>
              <option value="1">Service Provider</option>
            </select>
            {errors.role && <div className="field-error">{errors.role}</div>}
          </div>

          <SubmitButton>Create account</SubmitButton>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}