import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TxPreview } from "./tx-preview";

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

describe("TxPreview", () => {
  it("lists 3–5 recent txs with status pills", () => {
    render(<TxPreview />);

    const list = screen.getByRole("list");
    expect(list.querySelectorAll("li").length).toBeGreaterThanOrEqual(3);
    expect(list.querySelectorAll("li").length).toBeLessThanOrEqual(5);
    expect(screen.getAllByText("COMPLETE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("QUEUED")).toBeInTheDocument();
    expect(screen.getByText("FAILED")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/transactions",
    );
  });
});
