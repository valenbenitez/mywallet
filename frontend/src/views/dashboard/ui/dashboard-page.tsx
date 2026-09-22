"use client";

import { useWalletPortfolio } from "@/features/wallets";
import { InkOutlineCta } from "@/shared/ui/ink-outline-cta";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import { TxPreview } from "@/widgets/tx-preview/ui/tx-preview";
import { WalletAppShell } from "@/widgets/wallet-app-shell/ui/wallet-app-shell";
import { WalletBalances } from "@/widgets/wallet-balances/ui/wallet-balances";

/** Post-login home: live USDC balances, send/receive CTAs, portfolio, recent activity. */
export function DashboardPage() {
  const portfolio = useWalletPortfolio();

  return (
    <WalletAppShell title="Dashboard" hideTitle>
      {portfolio.status === "loading" ? (
        <p
          role="status"
          className="pt-[var(--spacing-8)] text-center font-switzer text-[length:var(--text-body)] text-slate-helper"
        >
          Loading balances…
        </p>
      ) : null}

      {portfolio.status === "error" ? (
        <p
          role="alert"
          className="pt-[var(--spacing-8)] text-center font-switzer text-[length:var(--text-body)] text-cherry-red"
        >
          {portfolio.message}
        </p>
      ) : null}

      {portfolio.status === "empty" ? (
        <p
          role="status"
          className="pt-[var(--spacing-8)] text-center font-switzer text-[length:var(--text-body)] text-slate-helper"
        >
          No wallets yet. Complete signup to create your deposit addresses.
        </p>
      ) : null}

      {portfolio.status === "success" ? (
        <>
          <section
            aria-label="Available balance"
            className="flex flex-col items-center gap-[var(--spacing-8)] pt-[var(--spacing-8)] text-center"
          >
            <p className="font-switzer text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
              Available balance
            </p>
            <p className="font-basier-circle text-[length:var(--text-heading)] font-semibold leading-[var(--leading-heading)] tracking-[var(--tracking-heading)] text-portrait-ink">
              {portfolio.data.totalUsdc} USDC
            </p>
          </section>

          <section
            aria-label="Actions"
            className="grid grid-cols-2 gap-[var(--spacing-12)]"
          >
            <RainbowOutlineCta href="/send" className="w-full">
              Send
            </RainbowOutlineCta>
            <InkOutlineCta href="/receive" className="w-full">
              Receive
            </InkOutlineCta>
          </section>

          <WalletBalances balances={portfolio.data.balances} />
          <TxPreview />
        </>
      ) : null}
    </WalletAppShell>
  );
}
