import type { TransactionPublic, TransactionRow } from "./types";

const CHAINS = new Set(["MATIC-AMOY", "ETH-SEPOLIA"]);

/** OUTBOUND → destination; INBOUND → source. */
export function counterpartyFor(tx: TransactionPublic): string {
  return tx.direction === "OUTBOUND"
    ? tx.destinationAddress
    : tx.sourceAddress;
}

/** Map API DTO → list/preview row (safe defaults for unexpected chain values). */
export function toTransactionRow(tx: TransactionPublic): TransactionRow {
  const chain = CHAINS.has(tx.blockchain) ? tx.blockchain : "MATIC-AMOY";
  return {
    id: tx.id,
    direction: tx.direction,
    amount: tx.amount,
    token: tx.tokenSymbol,
    counterparty: counterpartyFor(tx),
    chain: chain as TransactionRow["chain"],
    status: tx.state,
    txHash: tx.txHash,
    createdAt: tx.createdAt,
  };
}
