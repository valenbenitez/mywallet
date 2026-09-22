"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ApiError } from "@/shared/api";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import { login } from "../api/auth";
import { saveSessionToken } from "../model/session";
import { AuthTextField } from "./auth-text-field";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setPending(true);
    try {
      const result = await login({ email, password });
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
      <AuthTextField
        id="login-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        disabled={pending}
      />
      <AuthTextField
        id="login-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
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
        {pending ? "Signing in…" : "Sign in"}
      </RainbowOutlineCta>
    </form>
  );
}
