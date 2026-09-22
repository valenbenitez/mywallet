import {
  getMockRecentTransactions,
  mockWallet,
} from "@/entities/wallet";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";
import { TxStatusPill } from "@/shared/ui/tx-status-pill";

/** Compact watchlist-style preview of 3–5 recent mock transactions. */
export function TxPreview() {
  const transactions = getMockRecentTransactions(mockWallet);

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
      <ul className="flex flex-col">
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="flex items-center gap-[var(--spacing-12)] border-b border-mist-hairline py-[var(--spacing-12)] last:border-b-0"
          >
            <span
              aria-hidden
              className={`flex size-10 shrink-0 items-center justify-center rounded-full font-switzer text-[length:var(--text-body)] font-medium ${
                tx.direction === "out"
                  ? "bg-peach-wash text-portrait-ink"
                  : "bg-mint-wash text-portrait-ink"
              }`}
            >
              {tx.direction === "out" ? "↑" : "↓"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink">
                {tx.direction === "out" ? "Sent" : "Received"} {tx.amount}{" "}
                {tx.token}
              </p>
              <p className="truncate font-switzer text-[length:var(--text-caption)] text-slate-helper">
                {tx.id}
              </p>
            </div>
            <TxStatusPill status={tx.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
