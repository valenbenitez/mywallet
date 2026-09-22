"use client";

import type { FormEvent } from "react";
import {
  CHAIN_LABELS,
  getMockUsdcBalances,
  mockWallet,
  type WalletBalance,
} from "@/entities/wallet";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import type { SendDraft } from "../model/types";
import { SendTextField } from "./send-text-field";

const CHAINS = Object.keys(CHAIN_LABELS) as WalletBalance["chain"][];

type SendFormProps = {
  draft: SendDraft;
  onChange: (draft: SendDraft) => void;
  onContinue: () => void;
};

/** Step 1: chain + destination + amount → Continue (mock, no validation UI). */
export function SendForm({ draft, onChange, onContinue }: SendFormProps) {
  const balances = getMockUsdcBalances(mockWallet);
  const available =
    balances.find((b) => b.chain === draft.chain)?.amount ?? "0";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onContinue();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-[var(--spacing-16)]"
      noValidate
    >
      <div className="flex flex-col gap-[var(--spacing-8)]">
        <label
          htmlFor="send-chain"
          className="font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink"
        >
          Chain
        </label>
        <select
          id="send-chain"
          name="chain"
          value={draft.chain}
          onChange={(event) =>
            onChange({
              ...draft,
              chain: event.target.value as SendDraft["chain"],
            })
          }
          className="rounded-[var(--radius-inputs)] border border-fog-edge bg-white-canvas px-[var(--spacing-16)] py-[12px] font-switzer text-[length:var(--text-body)] text-portrait-ink outline-none focus:border-charcoal-outline"
        >
          {CHAINS.map((chain) => (
            <option key={chain} value={chain}>
              {CHAIN_LABELS[chain]}
            </option>
          ))}
        </select>
        <p className="font-switzer text-[length:var(--text-caption)] text-slate-helper">
          Available: {available} USDC
        </p>
      </div>

      <SendTextField
        id="send-destination"
        label="Destination address"
        name="destinationAddress"
        type="text"
        autoComplete="off"
        placeholder="0x…"
        value={draft.destinationAddress}
        onChange={(event) =>
          onChange({ ...draft, destinationAddress: event.target.value })
        }
        required
      />

      <SendTextField
        id="send-amount"
        label="Amount (USDC)"
        name="amount"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={draft.amount}
        onChange={(event) =>
          onChange({ ...draft, amount: event.target.value })
        }
        required
      />

      <RainbowOutlineCta type="submit" className="mt-[var(--spacing-8)] w-full">
        Continue
      </RainbowOutlineCta>
    </form>
  );
}
