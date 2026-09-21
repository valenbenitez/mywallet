import type {
  WalletAccountType,
  WalletBlockchain,
  WalletState,
} from '../domain/wallet.js';

export type WalletPublic = {
  id: string;
  circleWalletId: string;
  address: string;
  blockchain: WalletBlockchain;
  accountType: WalletAccountType;
  state: WalletState;
  createdAt: Date;
};

export type WalletListResponse = {
  wallets: WalletPublic[];
};

export type WalletBalancePublic = {
  tokenId: string;
  tokenSymbol: string;
  amount: string;
};

export type WalletBalancesResponse = {
  balances: WalletBalancePublic[];
};
