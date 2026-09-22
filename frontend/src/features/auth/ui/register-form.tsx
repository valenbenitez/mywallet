"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ApiError } from "@/shared/api";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import { signup } from "../api/auth";
import { saveSessionToken } from "../model/session";
import { AuthTextField } from "./auth-text-field";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const result = await signup({ email, password, firstName, lastName });
      saveSessionToken(result.accessToken);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-[var(--spacing-16)]"
      noValidate
    >
      <div className="grid grid-cols-1 gap-[var(--spacing-16)] sm:grid-cols-2">
        <AuthTextField
          id="register-first-name"
          label="First name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          placeholder="Ada"
          required
          disabled={pending}
        />
        <AuthTextField
          id="register-last-name"
          label="Last name"
          name="lastName"
          type="text"
          autoComplete="family-name"
          placeholder="Lovelace"
          required
          disabled={pending}
        />
      </div>
      <AuthTextField
        id="register-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        disabled={pending}
      />
      <AuthTextField
        id="register-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        minLength={8}
        required
        disabled={pending}
      />
      <AuthTextField
        id="register-confirm-password"
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        minLength={8}
        required
        disabled={pending}
      />
      {error != null ? (
        <p
          role="alert"
          className="font-switzer text-[length:var(--text-body)] text-cherry-red"
        >
          {error}
        </p>
      ) : null}
      <RainbowOutlineCta
        type="submit"
        className="mt-[var(--spacing-8)] w-full"
        disabled={pending}
      >
        {pending ? "Creating account…" : "Create account"}
      </RainbowOutlineCta>
    </form>
  );
}
