"use client";

import {
  CHAIN_LABELS,
  truncateAddress,
} from "@/entities/wallet";
import { useTransactions } from "@/features/transactions";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";
import { TxStatusPill } from "@/shared/ui/tx-status-pill";

/** Compact preview of recent transactions from `GET /transactions`. */
export function TxPreview() {
  const txState = useTransactions({ limit: 4 });

  return (
    <section
      aria-label="Recent activity"
      className="flex flex-col gap-[var(--spacing-12)]"
    >
      <div className="flex items-center justify-between gap-[var(--spacing-12)]">
        <h2 className="font-switzer text-[length:var(--text-body)] font-semibold text-portrait-ink">
          Recent activity
        </h2>
        <GhostTextLink
          href="/transactions"
          className="text-[length:var(--text-caption)] text-slate-helper"
        >
          View all
        </GhostTextLink>
      </div>

      {txState.status === "loading" ? (
        <p
          role="status"
          className="py-[var(--spacing-12)] font-switzer text-[length:var(--text-caption)] text-slate-helper"
        >
          Loading activity…
        </p>
      ) : null}

      {txState.status === "error" ? (
        <p
          role="alert"
          className="py-[var(--spacing-12)] font-switzer text-[length:var(--text-caption)] text-cherry-red"
        >
          {txState.message}
        </p>
      ) : null}

      {txState.status === "empty" ? (
        <p
          role="status"
          className="py-[var(--spacing-12)] font-switzer text-[length:var(--text-caption)] text-slate-helper"
        >
          No recent activity.
        </p>
      ) : null}

      {txState.status === "success" ? (
        <ul className="flex flex-col">
          {txState.items.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center gap-[var(--spacing-12)] border-b border-mist-hairline py-[var(--spacing-12)] last:border-b-0"
            >
              <span
                aria-hidden
                className={`flex size-10 shrink-0 items-center justify-center rounded-full font-switzer text-[length:var(--text-body)] font-medium ${
                  tx.direction === "OUTBOUND"
                    ? "bg-peach-wash text-portrait-ink"
                    : "bg-mint-wash text-portrait-ink"
                }`}
              >
                {tx.direction === "OUTBOUND" ? "↑" : "↓"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink">
                  {tx.direction === "OUTBOUND" ? "Sent" : "Received"}{" "}
                  {tx.amount} {tx.token}
                </p>
                <p className="truncate font-switzer text-[length:var(--text-caption)] text-slate-helper">
                  {truncateAddress(tx.counterparty)} ·{" "}
                  {CHAIN_LABELS[tx.chain]}
                </p>
              </div>
              <TxStatusPill status={tx.status} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
