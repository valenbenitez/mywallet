/* TESTNET BLOCKCHAINGS */
export type WalletBlockchain = 'MATIC-AMOY' | 'ETH-SEPOLIA';

export type WalletState = 'LIVE' | 'FROZEN';

export type WalletAccountType = 'EOA';

export interface Wallet {
    id: string;
    userId: string;
    circleWalletId: string;
    address: string;
    blockchain: WalletBlockchain;
    accountType: WalletAccountType;
    state: WalletState;
    createdAt: Date;
    updatedAt: Date;
}
