import { GhostTextLink } from "@/shared/ui/ghost-text-link";

/** Step 3: mock success + link to transactions. */
export function SendSuccess() {
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
          Transfer submitted
        </p>
        <p className="mt-[var(--spacing-8)] font-switzer text-[length:var(--text-body)] text-slate-helper">
          Your USDC send is queued. Status updates will appear in activity once
          wired to Circle webhooks.
        </p>
      </article>

      <GhostTextLink href="/transactions">View transactions</GhostTextLink>
    </div>
  );
}
