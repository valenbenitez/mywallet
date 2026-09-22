"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CHAIN_LABELS } from "@/entities/wallet";
import {
  depositAddressForChain,
  useWallets,
} from "@/features/wallets";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";
import {
  RECEIVE_CHAINS,
  RECEIVE_NETWORK_HINTS,
  type ReceiveChain,
} from "../model/types";

/** Chain tabs + QR + full address + copy from live wallets. */
export function ReceiveFlow() {
  const walletsState = useWallets();
  const [chain, setChain] = useState<ReceiveChain>("MATIC-AMOY");
  const [copied, setCopied] = useState(false);

  const address =
    walletsState.status === "success"
      ? depositAddressForChain(walletsState.wallets, chain)
      : null;

  async function handleCopy() {
    if (address == null) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (walletsState.status === "loading") {
    return (
      <p
        role="status"
        className="font-switzer text-[length:var(--text-body)] text-slate-helper"
      >
        Loading wallets…
      </p>
    );
  }

  if (walletsState.status === "error") {
    return (
      <p
        role="alert"
        className="font-switzer text-[length:var(--text-body)] text-cherry-red"
      >
        {walletsState.message}
      </p>
    );
  }

  if (walletsState.status === "empty") {
    return (
      <p
        role="status"
        className="font-switzer text-[length:var(--text-body)] text-slate-helper"
      >
        No wallets yet. Complete signup to create your deposit addresses.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-[var(--spacing-24)]">
      <div
        role="tablist"
        aria-label="Network"
        className="flex gap-[var(--spacing-8)]"
      >
        {RECEIVE_CHAINS.map((option) => {
          const selected = option === chain;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              id={`receive-tab-${option}`}
              aria-selected={selected}
              aria-controls="receive-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setChain(option);
                setCopied(false);
              }}
              className={`rounded-[var(--radius-inputs)] px-[var(--spacing-16)] py-[10px] font-switzer text-[length:var(--text-body)] font-medium transition-colors ${
                selected
                  ? "border border-charcoal-outline bg-white-canvas text-portrait-ink"
                  : "border border-fog-edge bg-white-canvas text-slate-helper hover:text-portrait-ink"
              }`}
            >
              {CHAIN_LABELS[option]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="receive-panel"
        aria-labelledby={`receive-tab-${chain}`}
        className="flex flex-col gap-[var(--spacing-16)]"
      >
        {address == null ? (
          <p
            role="status"
            className="font-switzer text-[length:var(--text-body)] text-slate-helper"
          >
            No deposit address for {CHAIN_LABELS[chain]} yet.
          </p>
        ) : (
          <>
            <div
              data-testid="receive-qr"
              data-address={address}
              role="img"
              aria-label={`QR code for ${address}`}
              className="flex items-center justify-center self-start rounded-[var(--radius-cards)] border border-mist-hairline bg-white-canvas p-[var(--spacing-16)]"
            >
              <QRCodeSVG value={address} size={180} level="M" />
            </div>

            <div className="flex flex-col gap-[var(--spacing-8)]">
              <p className="font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink">
                Deposit address
              </p>
              <p
                data-testid="receive-address"
                className="break-all font-switzer text-[length:var(--text-body)] text-portrait-ink"
              >
                {address}
              </p>
              <p className="font-switzer text-[length:var(--text-caption)] text-slate-helper">
                {RECEIVE_NETWORK_HINTS[chain]}
              </p>
            </div>

            <RainbowOutlineCta
              type="button"
              onClick={handleCopy}
              className="w-full max-w-[280px]"
            >
              {copied ? "Copied" : "Copy address"}
            </RainbowOutlineCta>
          </>
        )}
      </div>
    </div>
  );
}
