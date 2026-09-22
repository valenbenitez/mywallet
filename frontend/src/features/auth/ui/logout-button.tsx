"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "../api/auth";
import { clearSessionToken } from "../model/session";

/** Best-effort BE logout + clear JWT + redirect to login. */
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) return;
    setPending(true);
    try {
      await logout();
    } catch {
      // Stateless JWT: always clear local session even if BE call fails.
    } finally {
      clearSessionToken();
      router.replace("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={pending}
      className="font-switzer text-[length:var(--text-body)] font-medium text-slate-helper transition-opacity hover:opacity-70 disabled:opacity-50"
    >
      {pending ? "Signing out…" : "Log out"}
    </button>
  );
}
