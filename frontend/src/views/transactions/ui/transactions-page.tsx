import { getMockTransactions, mockWallet } from "@/entities/wallet";
import { PageShell } from "@/shared/ui/page-shell";

export function TransactionsPage() {
  const transactions = getMockTransactions(mockWallet);

  return (
    <PageShell title="Transactions">
      <ul className="flex flex-col gap-[var(--spacing-12)]">
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="rounded-[var(--radius-cards)] border border-mist-hairline bg-white-canvas p-[var(--card-padding)] shadow-[var(--shadow-subtle-5)]"
          >
            <p className="font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink">
              {tx.direction === "out" ? "Sent" : "Received"} {tx.amount}{" "}
              {tx.token}
            </p>
            <p className="font-switzer text-[length:var(--text-caption)] text-slate-helper">
              {tx.status} · {tx.id}
            </p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
