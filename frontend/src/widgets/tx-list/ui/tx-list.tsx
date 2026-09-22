import {
  CHAIN_LABELS,
  getExplorerUrl,
  getMockTransactions,
  mockWallet,
  truncateAddress,
} from "@/entities/wallet";
import { TxStatusPill } from "@/shared/ui/tx-status-pill";

/** Full mock transaction list — dense rows with status chips and explorer links. */
export function TxList() {
  const transactions = getMockTransactions(mockWallet);

  return (
    <ul
      aria-label="Transactions"
      className="flex flex-col"
    >
      {transactions.map((tx) => {
        const directionLabel =
          tx.direction === "out" ? "OUTBOUND" : "INBOUND";
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
                  tx.direction === "out"
                    ? "bg-peach-wash text-portrait-ink"
                    : "bg-mint-wash text-portrait-ink"
                }`}
              >
                {tx.direction === "out" ? "↑" : "↓"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink">
                  {directionLabel} {tx.amount} {tx.token}
                </p>
                <p className="font-switzer text-[length:var(--text-caption)] text-slate-helper">
                  {truncateAddress(tx.counterparty)} · {CHAIN_LABELS[tx.chain]}
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
  );
}
