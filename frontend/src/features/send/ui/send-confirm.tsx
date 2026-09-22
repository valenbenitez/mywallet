"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CHAIN_LABELS } from "@/entities/wallet";
import { clearSessionToken } from "@/features/auth/model/session";
import { ApiError } from "@/shared/api";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import { createTransfer, estimateTransferFee } from "../api/transfers";
import {
  defaultFeeLevel,
  feeLevelOptions,
  formatNetworkFee,
} from "../model/fee-display";
import { transferErrorMessage } from "../model/transfer-errors";
import type {
  FeeEstimateResponse,
  FeeLevel,
  SendDraft,
  TransactionPublic,
} from "../model/types";

type SendConfirmProps = {
  draft: SendDraft;
  walletId: string;
  onBack: () => void;
  onSuccess: (transaction: TransactionPublic) => void;
};

type EstimateState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; estimate: FeeEstimateResponse };

/** Step 2: live fee preview (low/medium/high) + create transfer. */
export function SendConfirm({
  draft,
  walletId,
  onBack,
  onSuccess,
}: SendConfirmProps) {
  const router = useRouter();
  const [estimateState, setEstimateState] = useState<EstimateState>({
    status: "loading",
  });
  const [feeLevel, setFeeLevel] = useState<FeeLevel>("MEDIUM");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEstimate() {
      setEstimateState({ status: "loading" });
      setSubmitError(null);
      try {
        const estimate = await estimateTransferFee(walletId, {
          destinationAddress: draft.destinationAddress.trim(),
          amount: draft.amount.trim(),
          tokenSymbol: "USDC",
        });
        if (cancelled) return;
        const selected = defaultFeeLevel(estimate);
        if (selected == null) {
          setEstimateState({
            status: "error",
            message: "No fee levels returned. Try again.",
          });
          return;
        }
        setFeeLevel(selected);
        setEstimateState({ status: "success", estimate });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 401) {
          clearSessionToken();
          router.replace("/login");
          return;
        }
        setEstimateState({
          status: "error",
          message: transferErrorMessage(err),
        });
      }
    }

    void loadEstimate();
    return () => {
      cancelled = true;
    };
  }, [
    walletId,
    draft.destinationAddress,
    draft.amount,
    router,
  ]);

  async function handleConfirm() {
    setSubmitError(null);
    setPending(true);
    try {
      const { transaction } = await createTransfer(walletId, {
        destinationAddress: draft.destinationAddress.trim(),
        amount: draft.amount.trim(),
        tokenSymbol: "USDC",
        feeLevel,
        idempotencyKey: crypto.randomUUID(),
      });
      onSuccess(transaction);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        clearSessionToken();
        router.replace("/login");
        return;
      }
      setSubmitError(transferErrorMessage(err));
      setPending(false);
    }
  }

  if (estimateState.status === "loading") {
    return (
      <p
        role="status"
        className="font-switzer text-[length:var(--text-body)] text-slate-helper"
      >
        Estimating network fee…
      </p>
    );
  }

  if (estimateState.status === "error") {
    return (
      <div className="flex w-full flex-col gap-[var(--spacing-16)]">
        <p
          role="alert"
          className="font-switzer text-[length:var(--text-body)] text-cherry-red"
        >
          {estimateState.message}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink transition-opacity hover:opacity-70"
        >
          Back
        </button>
      </div>
    );
  }

  const options = feeLevelOptions(estimateState.estimate);

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
              Chain
            </dt>
            <dd className="text-portrait-ink">{CHAIN_LABELS[draft.chain]}</dd>
          </div>
        </dl>
      </article>

      <fieldset className="flex flex-col gap-[var(--spacing-12)]">
        <legend className="font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink">
          Network fee
        </legend>
        {options.map((option) => {
          const selected = option.feeLevel === feeLevel;
          return (
            <label
              key={option.feeLevel}
              className={`flex cursor-pointer items-center justify-between gap-[var(--spacing-12)] rounded-[var(--radius-inputs)] border px-[var(--spacing-16)] py-[12px] font-switzer text-[length:var(--text-body)] ${
                selected
                  ? "border-charcoal-outline bg-white-canvas text-portrait-ink"
                  : "border-fog-edge bg-white-canvas text-slate-helper"
              }`}
            >
              <span className="flex items-center gap-[var(--spacing-8)]">
                <input
                  type="radio"
                  name="feeLevel"
                  value={option.feeLevel}
                  checked={selected}
                  disabled={pending}
                  onChange={() => setFeeLevel(option.feeLevel)}
                  className="accent-portrait-ink"
                />
                {option.feeLevel}
              </span>
              <span>{formatNetworkFee(option)}</span>
            </label>
          );
        })}
      </fieldset>

      {submitError != null ? (
        <p
          role="alert"
          className="font-switzer text-[length:var(--text-body)] text-cherry-red"
        >
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-col gap-[var(--spacing-12)]">
        <RainbowOutlineCta
          type="button"
          className="w-full"
          onClick={() => void handleConfirm()}
          disabled={pending}
        >
          {pending ? "Submitting…" : "Confirm transfer"}
        </RainbowOutlineCta>
        <button
          type="button"
          onClick={onBack}
          disabled={pending}
          className="inline-flex items-center justify-center font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink transition-opacity hover:opacity-70 disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
