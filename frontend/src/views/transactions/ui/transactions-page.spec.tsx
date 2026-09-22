import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAIN_LABELS,
  getExplorerUrl,
  getMockTransactions,
  mockWallet,
  truncateAddress,
} from "@/entities/wallet";
import { BRAND_NAME } from "@/shared/config/brand";
import { TransactionsPage } from "./transactions-page";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/transactions",
}));

describe("TransactionsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders AppNav, Transactions heading, and Portrait layout", () => {
    render(<TransactionsPage />);

    expect(screen.getByRole("navigation", { name: "App" })).toBeInTheDocument();
    expect(screen.getAllByText(BRAND_NAME).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("heading", { name: "Transactions" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Stub")).not.toBeInTheDocument();
  });

  it("lists ≥5 mock rows with direction, amount, chain, truncated address, and status", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<TransactionsPage />);

    const list = screen.getByRole("list", { name: "Transactions" });
    const rows = list.querySelectorAll("li");
    expect(rows.length).toBeGreaterThanOrEqual(5);

    expect(screen.getAllByText(/INBOUND/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/OUTBOUND/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("COMPLETE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("QUEUED")).toBeInTheDocument();

    for (const tx of getMockTransactions(mockWallet)) {
      expect(
        screen.getByText(truncateAddress(tx.counterparty), { exact: false }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(CHAIN_LABELS[tx.chain], { exact: false }).length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(`${tx.amount} ${tx.token}`, { exact: false }),
      ).toBeInTheDocument();
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("links COMPLETE txs to mock explorer URLs and skips non-COMPLETE", () => {
    render(<TransactionsPage />);

    const explorerLinks = screen.getAllByRole("link", {
      name: "View on explorer",
    });
    const completeWithHash = getMockTransactions(mockWallet).filter(
      (tx) => tx.status === "COMPLETE" && tx.txHash,
    );
    expect(explorerLinks).toHaveLength(completeWithHash.length);

    const hrefs = explorerLinks.map((el) => el.getAttribute("href"));
    for (const tx of completeWithHash) {
      expect(hrefs).toContain(getExplorerUrl(tx.chain, tx.txHash!));
    }

    for (const tx of getMockTransactions(mockWallet)) {
      if (tx.status === "COMPLETE" || !tx.txHash) continue;
      expect(hrefs.every((href) => !href?.includes(tx.txHash!))).toBe(true);
    }
  });

  it("uses white canvas layout without PageShell Stub", () => {
    const { container } = render(<TransactionsPage />);

    expect(container.firstChild).toHaveClass("bg-white-canvas");
    expect(screen.queryByText("Stub")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Primary" }),
    ).not.toBeInTheDocument();
  });
});
