"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { clearSessionToken } from "@/features/auth/model/session";
import { ApiError } from "@/shared/api";
import { listTransactions } from "../api/transactions";
import { toTransactionRow } from "./map-transaction";
import type {
  ListTransactionsQuery,
  TransactionRow,
} from "./types";

export type UseTransactionsOptions = Pick<
  ListTransactionsQuery,
  "walletId" | "direction" | "state" | "limit"
>;

export type TransactionsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | {
      status: "success";
      items: TransactionRow[];
      nextCursor: string | null;
      loadingMore: boolean;
      loadMoreError: string | null;
      loadMore: () => void;
    };

/**
 * Loads `GET /transactions` on mount (refreshes when navigating back after send).
 * Supports cursor pagination via `loadMore` when `nextCursor` is present.
 * 401 → clear session and redirect to login.
 */
export function useTransactions(
  options: UseTransactionsOptions = {},
): TransactionsState {
  const { walletId, direction, state, limit = 20 } = options;
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "error" | "ready">("loading");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<TransactionRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase("loading");
      try {
        const res = await listTransactions({
          walletId,
          direction,
          state,
          limit,
        });
        if (cancelled) return;
        const rows = res.items.map(toTransactionRow);
        setItems(rows);
        setNextCursor(res.nextCursor);
        setLoadMoreError(null);
        setPhase("ready");
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 401) {
          clearSessionToken();
          router.replace("/login");
          return;
        }
        setMessage(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
        );
        setPhase("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, walletId, direction, state, limit]);

  const loadMore = useCallback(() => {
    if (nextCursor == null || loadingMore) return;

    void (async () => {
      setLoadingMore(true);
      setLoadMoreError(null);
      try {
        const res = await listTransactions({
          walletId,
          direction,
          state,
          limit,
          cursor: nextCursor,
        });
        setItems((prev) => [...prev, ...res.items.map(toTransactionRow)]);
        setNextCursor(res.nextCursor);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
          clearSessionToken();
          router.replace("/login");
          return;
        }
        setLoadMoreError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setLoadingMore(false);
      }
    })();
  }, [
    nextCursor,
    loadingMore,
    walletId,
    direction,
    state,
    limit,
    router,
  ]);

  if (phase === "loading") return { status: "loading" };
  if (phase === "error") return { status: "error", message };
  if (items.length === 0) return { status: "empty" };
  return {
    status: "success",
    items,
    nextCursor,
    loadingMore,
    loadMoreError,
    loadMore,
  };
}
