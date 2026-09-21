"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import { AuthTextField } from "./auth-text-field";

/** Happy-path mock register — no API; navigates to dashboard on submit. */
export function RegisterForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-[400px] flex-col gap-[var(--spacing-16)]"
      noValidate
    >
      <AuthTextField
        id="register-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <AuthTextField
        id="register-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
      />
      <AuthTextField
        id="register-confirm-password"
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
      />
      <RainbowOutlineCta type="submit" className="mt-[var(--spacing-8)] w-full">
        Create account
      </RainbowOutlineCta>
    </form>
  );
}
