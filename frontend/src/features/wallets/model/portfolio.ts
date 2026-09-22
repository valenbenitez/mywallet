import {
  getWalletBalances,
  listWallets,
  type WalletBlockchain,
  type WalletPublic,
} from "../api/wallets";

/** USDC row joined to its owning wallet (chain comes from the wallet, not the balance). */
export type ChainUsdcBalance = {
  walletId: string;
  chain: WalletBlockchain;
  address: string;
  amount: string;
};

export type WalletPortfolio = {
  wallets: WalletPublic[];
  balances: ChainUsdcBalance[];
  totalUsdc: string;
};

function usdcAmountFromBalances(
  balances: { tokenSymbol: string; amount: string }[],
): string {
  const usdc = balances.find((b) => b.tokenSymbol === "USDC");
  return usdc?.amount ?? "0.00";
}

/** Sum USDC decimal strings across chains for the dashboard hero. */
export function sumUsdcAmounts(amounts: string[]): string {
  const total = amounts.reduce(
    (sum, amount) => sum + Number.parseFloat(amount),
    0,
  );
  return Number.isFinite(total) ? total.toFixed(2) : "0.00";
}

/**
 * `GET /wallets` then `GET /wallets/:id/balances` per wallet.
 * Joins address + blockchain with USDC amount (missing USDC → `"0.00"`).
 */
export async function fetchWalletPortfolio(): Promise<WalletPortfolio> {
  const { wallets } = await listWallets();

  const balances = await Promise.all(
    wallets.map(async (wallet) => {
      const { balances: tokenBalances } = await getWalletBalances(wallet.id);
      return {
        walletId: wallet.id,
        chain: wallet.blockchain,
        address: wallet.address,
        amount: usdcAmountFromBalances(tokenBalances),
      } satisfies ChainUsdcBalance;
    }),
  );

  return {
    wallets,
    balances,
    totalUsdc: sumUsdcAmounts(balances.map((b) => b.amount)),
  };
}

/** Deposit address for a chain, or `null` if the user has no wallet on that chain. */
export function depositAddressForChain(
  wallets: WalletPublic[],
  chain: WalletBlockchain,
): string | null {
  return wallets.find((w) => w.blockchain === chain)?.address ?? null;
}
