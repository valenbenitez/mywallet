/** Client-side limits aligned with BE TRANSFER_MIN_USDC / TRANSFER_MAX_USDC defaults. */
export const TRANSFER_MIN_USDC = 5;
export const TRANSFER_MAX_USDC = 15000;

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const DECIMAL_AMOUNT_RE = /^\d+(\.\d+)?$/;

export type SendFormValidation =
  | { ok: true }
  | { ok: false; message: string };

/** Validate destination + amount before estimate-fee / continue. */
export function validateSendDraft(input: {
  destinationAddress: string;
  amount: string;
}): SendFormValidation {
  const destinationAddress = input.destinationAddress.trim();
  const amount = input.amount.trim();

  if (!EVM_ADDRESS_RE.test(destinationAddress)) {
    return {
      ok: false,
      message: "Enter a valid destination address (0x…).",
    };
  }

  if (!DECIMAL_AMOUNT_RE.test(amount)) {
    return {
      ok: false,
      message: "Amount must be a decimal number.",
    };
  }

  const value = Number.parseFloat(amount);
  if (!Number.isFinite(value)) {
    return {
      ok: false,
      message: "Amount must be a decimal number.",
    };
  }

  if (value < TRANSFER_MIN_USDC) {
    return {
      ok: false,
      message: `Minimum send is ${TRANSFER_MIN_USDC} USDC.`,
    };
  }

  if (value > TRANSFER_MAX_USDC) {
    return {
      ok: false,
      message: `Maximum send is ${TRANSFER_MAX_USDC} USDC.`,
    };
  }

  return { ok: true };
}
