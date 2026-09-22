"use client";

import { CHAIN_LABELS } from "@/entities/wallet";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import {
  formatMockNetworkFee,
  getMockFeeEstimate,
} from "../model/mock-fee";
import type { SendDraft } from "../model/types";

type SendConfirmProps = {
  draft: SendDraft;
  onBack: () => void;
  onConfirm: () => void;
};

/** Step 2: summary + mock fee preview + Confirm CTA. */
export function SendConfirm({ draft, onBack, onConfirm }: SendConfirmProps) {
  const feeEstimate = getMockFeeEstimate(draft);
  const feeLabel = formatMockNetworkFee(feeEstimate);

  return (
    <div className="flex w-full flex-col gap-[var(--spacing-24)]">
      <article
        aria-label="Transfer summary"
        className="rounded-[var(--radius-cards)] border border-mist-hairline bg-white-canvas p-[var(--card-padding)] shadow-[var(--shadow-subtle)]"
      >
        <dl className="flex flex-col gap-[var(--spacing-12)] font-switzer text-[length:var(--text-body)]">
          <div className="flex flex-col gap-[var(--spacing-4)]">
            <dt className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
              Destination
            </dt>
            <dd className="break-all text-portrait-ink">
              {draft.destinationAddress}
            </dd>
          </div>
          <div className="flex flex-col gap-[var(--spacing-4)]">
            <dt className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
              Amount
            </dt>
            <dd className="text-portrait-ink">{draft.amount} USDC</dd>
          </div>
          <div className="flex flex-col gap-[var(--spacing-4)]">
            <dt className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
              Network fee
            </dt>
            <dd className="text-slate-helper">{feeLabel}</dd>
          </div>
          <div className="flex flex-col gap-[var(--spacing-4)]">
            <dt className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
              Chain
            </dt>
            <dd className="text-portrait-ink">{CHAIN_LABELS[draft.chain]}</dd>
          </div>
        </dl>
      </article>

      <div className="flex flex-col gap-[var(--spacing-12)]">
        <RainbowOutlineCta type="button" className="w-full" onClick={onConfirm}>
          Confirm transfer
        </RainbowOutlineCta>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink transition-opacity hover:opacity-70"
        >
          Back
        </button>
      </div>
    </div>
  );
}
