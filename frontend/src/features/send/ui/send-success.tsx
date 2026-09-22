import { GhostTextLink } from "@/shared/ui/ghost-text-link";
import type { TransactionPublic } from "../model/types";

type SendSuccessProps = {
  transaction: TransactionPublic;
};

/** Step 3: created transfer id + initial async state. */
export function SendSuccess({ transaction }: SendSuccessProps) {
  return (
    <div
      aria-label="Transfer submitted"
      className="flex w-full flex-col gap-[var(--spacing-24)]"
    >
      <article className="rounded-[var(--radius-cards)] border border-mist-hairline bg-white-canvas p-[var(--card-padding)] shadow-[var(--shadow-subtle)]">
        <p className="font-switzer text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
          Status
        </p>
        <p className="mt-[var(--spacing-8)] font-switzer text-[length:var(--text-body-lg)] font-medium text-portrait-ink">
          {transaction.state}
        </p>
        <p className="mt-[var(--spacing-8)] font-switzer text-[length:var(--text-body)] text-slate-helper">
          Transfer created. Status will update in activity as Circle webhooks
          arrive.
        </p>
        <dl className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-12)] font-switzer text-[length:var(--text-body)]">
          <div className="flex flex-col gap-[var(--spacing-4)]">
            <dt className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
              Transaction ID
            </dt>
            <dd className="break-all text-portrait-ink">{transaction.id}</dd>
          </div>
          <div className="flex flex-col gap-[var(--spacing-4)]">
            <dt className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
              Amount
            </dt>
            <dd className="text-portrait-ink">
              {transaction.amount} {transaction.tokenSymbol}
            </dd>
          </div>
        </dl>
      </article>

      <GhostTextLink href="/transactions">View transactions</GhostTextLink>
    </div>
  );
}
