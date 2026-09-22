import { TxList } from "@/widgets/tx-list/ui/tx-list";
import { WalletAppShell } from "@/widgets/wallet-app-shell/ui/wallet-app-shell";

/** Post-login transaction history from `GET /transactions`. */
export function TransactionsPage() {
  return (
    <WalletAppShell title="Transactions">
      <TxList />
    </WalletAppShell>
  );
}
