"use client";

import { useState } from "react";
import { useWalletPortfolio } from "@/features/wallets";
import type { SendDraft, SendStep, TransactionPublic } from "../model/types";
import { SendConfirm } from "./send-confirm";
import { SendForm } from "./send-form";
import { SendSuccess } from "./send-success";

const INITIAL_DRAFT: SendDraft = {
  chain: "MATIC-AMOY",
  destinationAddress: "",
  amount: "",
};

/** Local step state: form → estimate-fee confirm → create transfer success. */
export function SendFlow() {
  const portfolio = useWalletPortfolio();
  const [step, setStep] = useState<SendStep>("form");
  const [draft, setDraft] = useState<SendDraft>(INITIAL_DRAFT);
  const [transaction, setTransaction] = useState<TransactionPublic | null>(
    null,
  );

  if (portfolio.status === "loading") {
    return (
      <p
        role="status"
        className="font-switzer text-[length:var(--text-body)] text-slate-helper"
      >
        Loading wallets…
      </p>
    );
  }

  if (portfolio.status === "error") {
    return (
      <p
        role="alert"
        className="font-switzer text-[length:var(--text-body)] text-cherry-red"
      >
        {portfolio.message}
      </p>
    );
  }

  if (portfolio.status === "empty") {
    return (
      <p
        role="status"
        className="font-switzer text-[length:var(--text-body)] text-slate-helper"
      >
        No wallets yet. Complete signup to create your deposit addresses.
      </p>
    );
  }

  const walletId =
    portfolio.data.wallets.find((w) => w.blockchain === draft.chain)?.id ??
    null;

  if (step === "success" && transaction != null) {
    return <SendSuccess transaction={transaction} />;
  }

  if (step === "confirm") {
    if (walletId == null) {
      return (
        <div className="flex w-full flex-col gap-[var(--spacing-16)]">
          <p
            role="alert"
            className="font-switzer text-[length:var(--text-body)] text-cherry-red"
          >
            No wallet on this chain yet.
          </p>
          <button
            type="button"
            onClick={() => setStep("form")}
            className="inline-flex items-center justify-center font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink transition-opacity hover:opacity-70"
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <SendConfirm
        draft={draft}
        walletId={walletId}
        onBack={() => setStep("form")}
        onSuccess={(tx) => {
          setTransaction(tx);
          setStep("success");
        }}
      />
    );
  }

  return (
    <SendForm
      draft={draft}
      balances={portfolio.data.balances}
      hasWallet={walletId != null}
      onChange={setDraft}
      onContinue={() => setStep("confirm")}
    />
  );
}
