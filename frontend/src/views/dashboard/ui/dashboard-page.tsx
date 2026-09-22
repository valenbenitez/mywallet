import { getMockTotalUsdcBalance, mockWallet } from "@/entities/wallet";
import { InkOutlineCta } from "@/shared/ui/ink-outline-cta";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import { TxPreview } from "@/widgets/tx-preview/ui/tx-preview";
import { WalletAppShell } from "@/widgets/wallet-app-shell/ui/wallet-app-shell";
import { WalletBalances } from "@/widgets/wallet-balances/ui/wallet-balances";

/** Post-login home: balance hero, send/receive CTAs, portfolio, recent activity. */
export function DashboardPage() {
  const total = getMockTotalUsdcBalance(mockWallet);

  return (
    <WalletAppShell title="Dashboard" hideTitle>
      <section
        aria-label="Available balance"
        className="flex flex-col items-center gap-[var(--spacing-8)] pt-[var(--spacing-8)] text-center"
      >
        <p className="font-switzer text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
          Available balance
        </p>
        <p className="font-basier-circle text-[length:var(--text-heading)] font-semibold leading-[var(--leading-heading)] tracking-[var(--tracking-heading)] text-portrait-ink">
          {total} USDC
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

      <WalletBalances />
      <TxPreview />
    </WalletAppShell>
  );
}
