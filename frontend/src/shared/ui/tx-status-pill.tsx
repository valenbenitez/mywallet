import type { TransactionState } from "@/features/transactions";

const PENDING =
  "bg-sky-wash text-nautical-teal";
const SUCCESS =
  "bg-mint-wash text-nautical-teal";
const FAILURE =
  "bg-peach-wash text-charcoal-outline";
const WARNING =
  "bg-peach-wash text-nautical-teal";

const STATUS_PILL: Record<TransactionState, string> = {
  COMPLETE: SUCCESS,
  QUEUED: PENDING,
  INITIATED: PENDING,
  CLEARED: PENDING,
  SENT: PENDING,
  CONFIRMED: PENDING,
  STUCK: WARNING,
  FAILED: FAILURE,
  CANCELLED: FAILURE,
  DENIED: FAILURE,
};

type TxStatusPillProps = {
  status: TransactionState;
};

/** Pastel status chip shared by dashboard preview and full tx list. */
export function TxStatusPill({ status }: TxStatusPillProps) {
  const tone = STATUS_PILL[status] ?? PENDING;
  return (
    <span
      className={`shrink-0 rounded-[var(--radius-tags)] px-[var(--spacing-8)] py-[3px] font-switzer text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] ${tone}`}
    >
      {status}
    </span>
  );
}
