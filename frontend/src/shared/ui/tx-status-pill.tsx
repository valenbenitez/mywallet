import type { WalletTransactionStatus } from "@/entities/wallet";

const STATUS_PILL: Record<WalletTransactionStatus, string> = {
  COMPLETE: "bg-mint-wash text-nautical-teal",
  QUEUED: "bg-sky-wash text-nautical-teal",
  FAILED: "bg-peach-wash text-charcoal-outline",
};

type TxStatusPillProps = {
  status: WalletTransactionStatus;
};

/** Pastel status chip shared by dashboard preview and full tx list. */
export function TxStatusPill({ status }: TxStatusPillProps) {
  return (
    <span
      className={`shrink-0 rounded-[var(--radius-tags)] px-[var(--spacing-8)] py-[3px] font-switzer text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] ${STATUS_PILL[status]}`}
    >
      {status}
    </span>
  );
}
