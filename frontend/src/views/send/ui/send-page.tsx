import { SendFlow } from "@/features/send";
import { WalletAppShell } from "@/widgets/wallet-app-shell/ui/wallet-app-shell";

/** Post-login send flow: form → fee preview confirm → success mock. */
export function SendPage() {
  return (
    <WalletAppShell title="Send">
      <div className="w-full">
        <SendFlow />
      </div>
    </WalletAppShell>
  );
}
