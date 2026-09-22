import { ReceiveFlow } from "@/features/receive";
import { WalletAppShell } from "@/widgets/wallet-app-shell/ui/wallet-app-shell";

/** Post-login receive: chain tabs, QR, full address, and copy from live wallets. */
export function ReceivePage() {
  return (
    <WalletAppShell title="Receive">
      <div className="w-full">
        <ReceiveFlow />
      </div>
    </WalletAppShell>
  );
}
