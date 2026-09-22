import { ApiError } from "@/shared/api";

/** Map transfer API failures to clear UI copy (prefer BE message when useful). */
export function transferErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (err.statusCode === 409) {
    return err.message.includes("idempotency")
      ? "This transfer was already submitted. Check your activity."
      : err.message;
  }

  if (err.statusCode === 422) {
    return err.message.includes("Insufficient")
      ? "Insufficient USDC balance for this transfer."
      : err.message;
  }

  if (err.statusCode === 403) {
    return err.message || "You do not own this wallet.";
  }

  if (err.statusCode === 404) {
    return err.message || "Wallet not found.";
  }

  if (err.statusCode === 400 || err.statusCode === 502) {
    return err.message;
  }

  return err.message || "Something went wrong. Please try again.";
}
