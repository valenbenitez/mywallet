"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getSessionToken } from "../model/session";

type GuestOnlyProps = {
  children: ReactNode;
};

/**
 * Client gate for login/register: if a JWT is already stored, send to dashboard.
 */
export function GuestOnly({ children }: GuestOnlyProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getSessionToken() != null) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-white-canvas px-[var(--spacing-20)]">
        <p className="font-switzer text-[length:var(--text-body)] text-slate-helper">
          Redirecting…
        </p>
      </div>
    );
  }

  return children;
}
