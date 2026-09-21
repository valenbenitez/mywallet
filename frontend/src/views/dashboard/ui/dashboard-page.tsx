import { getMockUsdcBalance, mockWallet } from "@/entities/wallet";
import { PageShell } from "@/shared/ui/page-shell";

export function DashboardPage() {
  const balance = getMockUsdcBalance(mockWallet);

  return (
    <PageShell title="Dashboard">
      <p className="font-switzer text-[length:var(--text-body)] text-slate-helper">
        Address: {mockWallet.address}
      </p>
      <p className="font-switzer text-[length:var(--text-body-lg)] font-medium text-portrait-ink">
        {balance} USDC
      </p>
    </PageShell>
  );
}
