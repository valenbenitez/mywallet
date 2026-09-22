import {
  CHAIN_LABELS,
  getMockDepositAddress,
  getMockUsdcBalances,
  mockWallet,
  truncateAddress,
} from "@/entities/wallet";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";

const CARD_WASH: Record<string, string> = {
  "MATIC-AMOY": "bg-mint-wash",
  "ETH-SEPOLIA": "bg-peach-wash",
};

/** Dual-chain USDC portfolio cards with truncated deposit address per chain. */
export function WalletBalances() {
  const balances = getMockUsdcBalances(mockWallet);

  return (
    <section
      aria-label="Balances"
      className="flex flex-col gap-[var(--spacing-12)] rounded-[var(--radius-cards)] bg-sky-wash p-[var(--spacing-16)]"
    >
      <div className="flex items-center justify-between gap-[var(--spacing-12)]">
        <h2 className="font-switzer text-[length:var(--text-body)] font-semibold text-portrait-ink">
          Portfolio
        </h2>
        <GhostTextLink
          href="/transactions"
          className="text-[length:var(--text-caption)] text-slate-helper"
        >
          View all
        </GhostTextLink>
      </div>

      <div className="grid grid-cols-2 gap-[var(--spacing-12)]">
        {balances.map((balance) => {
          const truncated = truncateAddress(
            getMockDepositAddress(balance.chain, mockWallet),
          );
          const wash = CARD_WASH[balance.chain] ?? "bg-white-canvas";

          return (
            <article
              key={balance.chain}
              className={`flex flex-col gap-[var(--spacing-8)] rounded-[var(--radius-cards)] p-[var(--spacing-16)] ${wash}`}
            >
              <div className="flex items-center gap-[var(--spacing-8)]">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white-canvas font-switzer text-[length:var(--text-caption)] font-semibold text-portrait-ink"
                >
                  $
                </span>
                <p className="min-w-0 truncate font-switzer text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.08em] text-slate-helper">
                  {CHAIN_LABELS[balance.chain]}
                </p>
              </div>
              <p className="font-switzer text-[length:var(--text-body-lg)] font-semibold text-portrait-ink">
                {balance.amount} USDC
              </p>
              <p className="font-switzer text-[length:var(--text-caption)] text-slate-helper">
                {truncated}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
