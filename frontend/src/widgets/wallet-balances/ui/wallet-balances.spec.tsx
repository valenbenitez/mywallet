import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { WalletBalances } from "./wallet-balances";

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

describe("WalletBalances", () => {
  it("renders Amoy and Sepolia USDC with truncated per-chain addresses", () => {
    render(<WalletBalances />);

    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Polygon Amoy")).toBeInTheDocument();
    expect(screen.getByText("Ethereum Sepolia")).toBeInTheDocument();
    expect(screen.getByText("50.00 USDC")).toBeInTheDocument();
    expect(screen.getByText("125.50 USDC")).toBeInTheDocument();
    expect(screen.getByText("0x1111…1111")).toBeInTheDocument();
    expect(screen.getByText("0x2222…2222")).toBeInTheDocument();
  });
});
