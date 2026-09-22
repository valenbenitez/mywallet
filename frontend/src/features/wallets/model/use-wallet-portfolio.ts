"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSessionToken } from "@/features/auth/model/session";
import { ApiError } from "@/shared/api";
import {
  fetchWalletPortfolio,
  type WalletPortfolio,
} from "./portfolio";

export type WalletPortfolioState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "success"; data: WalletPortfolio };

/**
 * Loads wallets + per-chain USDC balances for Dashboard.
 * 401 → clear session and redirect to login (same as Auth guards).
 */
export function useWalletPortfolio(): WalletPortfolioState {
  const router = useRouter();
  const [state, setState] = useState<WalletPortfolioState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchWalletPortfolio();
        if (cancelled) return;
        if (data.wallets.length === 0) {
          setState({ status: "empty" });
          return;
        }
        setState({ status: "success", data });
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
