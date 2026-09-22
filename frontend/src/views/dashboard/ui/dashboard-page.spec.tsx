import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./dashboard-page";

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
  usePathname: () => "/dashboard",
}));

describe("DashboardPage", () => {
  it("shows dual-chain USDC balances with truncated addresses", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("175.50 USDC")).toBeInTheDocument();
    expect(screen.getByText("Polygon Amoy")).toBeInTheDocument();
    expect(screen.getByText("Ethereum Sepolia")).toBeInTheDocument();
    expect(screen.getByText("50.00 USDC")).toBeInTheDocument();
    expect(screen.getByText("125.50 USDC")).toBeInTheDocument();

    expect(screen.getByText("0x1111…1111")).toBeInTheDocument();
    expect(screen.getByText("0x2222…2222")).toBeInTheDocument();
    expect(
      screen.queryByText("0x1111111111111111111111111111111111111111"),
    ).not.toBeInTheDocument();
  });

  it("exposes nav and action links to send, receive, and transactions", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("navigation", { name: "App" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();

    const actions = screen.getByRole("region", { name: "Actions" });
    const send = actions.querySelector('a[href="/send"]');
    const receive = actions.querySelector('a[href="/receive"]');
    expect(send).toHaveClass("rainbow-outline");
    expect(receive).toHaveTextContent("Receive");
    expect(receive?.className).not.toMatch(/rainbow-outline/);

    expect(
      screen.getAllByRole("link", { name: "Send" }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole("link", { name: "Receive" }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole("link", { name: "Transactions" }).length,
    ).toBeGreaterThanOrEqual(1);

    // No redundant body text-link row duplicating nav.
    expect(actions.querySelector('a[href="/transactions"]')).toBeNull();
  });

  it("previews 3–5 recent mock transactions with visible status", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<DashboardPage />);

    const preview = screen.getByRole("region", { name: "Recent activity" });
    const rows = preview.querySelectorAll("li");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows.length).toBeLessThanOrEqual(5);

    expect(screen.getAllByText("COMPLETE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("QUEUED")).toBeInTheDocument();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("uses a minimal white canvas layout without a sidebar", () => {
    const { container } = render(<DashboardPage />);

    expect(container.firstChild).toHaveClass("bg-white-canvas");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(screen.queryByText("Stub")).not.toBeInTheDocument();
  });
});
