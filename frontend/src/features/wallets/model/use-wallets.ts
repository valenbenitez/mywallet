"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSessionToken } from "@/features/auth/model/session";
import { ApiError } from "@/shared/api";
import { listWallets, type WalletPublic } from "../api/wallets";

export type WalletsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "success"; wallets: WalletPublic[] };

/**
 * Loads `GET /wallets` for Receive (address / QR / copy).
 * 401 → clear session and redirect to login.
 */
export function useWallets(): WalletsState {
  const router = useRouter();
  const [state, setState] = useState<WalletsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { wallets } = await listWallets();
        if (cancelled) return;
        if (wallets.length === 0) {
          setState({ status: "empty" });
          return;
        }
        setState({ status: "success", wallets });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 401) {
          clearSessionToken();
          router.replace("/login");
          return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.";
        setState({ status: "error", message });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return state;
}
