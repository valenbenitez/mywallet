import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  getExplorerUrl,
  getMockTransactions,
  mockWallet,
  truncateAddress,
} from "@/entities/wallet";
import { TxList } from "./tx-list";

describe("TxList", () => {
  it("renders ≥5 rows with pastel status chips and explorer links on COMPLETE", () => {
    render(<TxList />);

    const list = screen.getByRole("list", { name: "Transactions" });
    expect(list.querySelectorAll("li").length).toBeGreaterThanOrEqual(5);

    expect(screen.getAllByText("COMPLETE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("QUEUED")).toBeInTheDocument();

    const complete = getMockTransactions(mockWallet).find(
      (tx) => tx.status === "COMPLETE" && tx.txHash,
    );
    expect(complete).toBeDefined();
    expect(
      screen.getByText(truncateAddress(complete!.counterparty), {
        exact: false,
      }),
    ).toBeInTheDocument();

    const href = getExplorerUrl(complete!.chain, complete!.txHash!);
    expect(
      screen.getAllByRole("link", { name: "View on explorer" }).some(
        (el) => el.getAttribute("href") === href,
      ),
    ).toBe(true);
  });
});
