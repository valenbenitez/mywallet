import { apiRequest } from "@/shared/api";
import type { WalletBalance } from "@/entities/wallet";

export type WalletBlockchain = WalletBalance["chain"];

export type WalletPublic = {
  id: string;
  circleWalletId: string;
  address: string;
  blockchain: WalletBlockchain;
  accountType: string;
  state: string;
  createdAt: string;
};

export type WalletListResponse = {
  wallets: WalletPublic[];
};

export type WalletBalancePublic = {
  tokenId: string;
  tokenSymbol: string;
  /** Decimal string from Circle — do not coerce to number for display/storage. */
  amount: string;
};

export type WalletBalancesResponse = {
  balances: WalletBalancePublic[];
};

/** `GET /wallets` — Bearer; list wallets for the authenticated user. */
export function listWallets(): Promise<WalletListResponse> {
  return apiRequest<WalletListResponse>("/wallets");
}

/** `GET /wallets/:id/balances` — Bearer; token balances for one wallet. */
export function getWalletBalances(
  walletId: string,
): Promise<WalletBalancesResponse> {
  return apiRequest<WalletBalancesResponse>(`/wallets/${walletId}/balances`);
}
