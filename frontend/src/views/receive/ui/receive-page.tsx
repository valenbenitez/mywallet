import { mockWallet } from "@/entities/wallet";
import { PageShell } from "@/shared/ui/page-shell";

export function ReceivePage() {
  return (
    <PageShell title="Receive">
      <p className="font-switzer text-[length:var(--text-body)] text-slate-helper">
        Deposit address (mock): {mockWallet.address}
      </p>
    </PageShell>
  );
}
