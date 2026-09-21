import type { WalletBlockchain, WalletState } from '../domain/wallet.js';

export type AuthUserPublic = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthUserWithCreatedAt = AuthUserPublic & {
  createdAt: Date;
};

export type AuthWalletPublic = {
  id: string;
  address: string;
  blockchain: WalletBlockchain;
  state: WalletState;
};

export type SignupResult = {
  user: AuthUserWithCreatedAt;
  accessToken: string;
  wallets: AuthWalletPublic[];
};

export type LoginResult = {
  user: AuthUserPublic;
  accessToken: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
};

export type RequestUser = AuthUserPublic;
