"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getMe } from "../api/auth";
import { clearSessionToken, getSessionToken } from "../model/session";

type RequireSessionProps = {
  children: ReactNode;
};

/**
 * Client gate for app routes: requires a local JWT, then validates via GET /auth/me.
 * Missing / invalid token → clear storage and redirect to /login.
 */
export function RequireSession({ children }: RequireSessionProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const token = getSessionToken();
      if (token == null) {
        router.replace("/login");
        return;
      }

      try {
        await getMe();
        if (!cancelled) setReady(true);
      } catch {
        clearSessionToken();
        if (!cancelled) router.replace("/login");
      }
    }

    void validate();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-white-canvas px-[var(--spacing-20)]">
        <p className="font-switzer text-[length:var(--text-body)] text-slate-helper">
          Checking session…
        </p>
      </div>
    );
  }

  return children;
}
