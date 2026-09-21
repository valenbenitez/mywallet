"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import { AuthTextField } from "./auth-text-field";

/** Happy-path mock login — no API; navigates to dashboard on submit. */
export function LoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
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
      />
      <AuthTextField
        id="login-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />
      <RainbowOutlineCta type="submit" className="mt-[var(--spacing-8)] w-full">
        Sign in
      </RainbowOutlineCta>
    </form>
  );
}
