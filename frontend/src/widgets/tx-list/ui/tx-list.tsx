"use client";

import {
  CHAIN_LABELS,
  getExplorerUrl,
  truncateAddress,
} from "@/entities/wallet";
import { useTransactions } from "@/features/transactions";
import { TxStatusPill } from "@/shared/ui/tx-status-pill";

/** Full transaction list — live `GET /transactions` with cursor load-more. */
export function TxList() {
  const txState = useTransactions({ limit: 20 });

  if (txState.status === "loading") {
    return (
      <p
        role="status"
        className="py-[var(--spacing-16)] text-center font-switzer text-[length:var(--text-body)] text-slate-helper"
      >
        Loading transactions…
      </p>
    );
  }

  if (txState.status === "error") {
    return (
      <p
        role="alert"
        className="py-[var(--spacing-16)] text-center font-switzer text-[length:var(--text-body)] text-cherry-red"
      >
        {txState.message}
      </p>
    );
  }

  if (txState.status === "empty") {
    return (
      <p
        role="status"
        className="py-[var(--spacing-16)] text-center font-switzer text-[length:var(--text-body)] text-slate-helper"
      >
        No transactions yet. Send or receive USDC to see activity here.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <ul aria-label="Transactions" className="flex flex-col">
        {txState.items.map((tx) => {
          const directionLabel = tx.direction;
          const explorerHref =
            tx.status === "COMPLETE" && tx.txHash
              ? getExplorerUrl(tx.chain, tx.txHash)
              : null;

          return (
            <li
              key={tx.id}
              className="flex flex-col gap-[var(--spacing-8)] border-b border-mist-hairline py-[var(--spacing-16)] last:border-b-0"
            >
              <div className="flex items-center gap-[var(--spacing-12)]">
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
                    {directionLabel} {tx.amount} {tx.token}
                  </p>
                  <p className="font-switzer text-[length:var(--text-caption)] text-slate-helper">
                    {truncateAddress(tx.counterparty)} ·{" "}
                    {CHAIN_LABELS[tx.chain]}
                  </p>
                </div>
                <TxStatusPill status={tx.status} />
              </div>
              {explorerHref ? (
                <a
                  href={explorerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-[calc(40px+var(--spacing-12))] font-switzer text-[length:var(--text-caption)] font-medium text-nautical-teal transition-opacity hover:opacity-70"
                >
                  View on explorer
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>

      {txState.nextCursor != null ? (
        <div className="flex flex-col items-center gap-[var(--spacing-8)] py-[var(--spacing-16)]">
          {txState.loadMoreError ? (
            <p
              role="alert"
              className="text-center font-switzer text-[length:var(--text-caption)] text-cherry-red"
            >
              {txState.loadMoreError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={txState.loadMore}
            disabled={txState.loadingMore}
            className="font-switzer text-[length:var(--text-caption)] font-medium text-nautical-teal transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            {txState.loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
