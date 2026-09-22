import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BRAND_NAME } from "@/shared/config/brand";
import { SendPage } from "./send-page";

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
  usePathname: () => "/send",
}));

describe("SendPage", () => {
  it("renders AppNav, Send heading, and Portrait chain + fields", () => {
    render(<SendPage />);

    expect(screen.getByRole("navigation", { name: "App" })).toBeInTheDocument();
    expect(screen.getAllByText(BRAND_NAME).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "Send" })).toBeInTheDocument();
    expect(screen.queryByText("Stub")).not.toBeInTheDocument();

    const chain = screen.getByLabelText("Chain");
    expect(chain).toHaveClass("rounded-[var(--radius-inputs)]");
    expect(screen.getByRole("option", { name: "Polygon Amoy" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Ethereum Sepolia" }),
    ).toBeInTheDocument();

    const destination = screen.getByLabelText("Destination address");
    const amount = screen.getByLabelText("Amount (USDC)");
    expect(destination).toHaveClass("rounded-[var(--radius-inputs)]");
    expect(amount).toHaveClass("rounded-[var(--radius-inputs)]");
  });

  it("selects Sepolia and shows available balance helper", async () => {
    const user = userEvent.setup();
    render(<SendPage />);

    const chain = screen.getByLabelText("Chain");
    await user.selectOptions(chain, "ETH-SEPOLIA");

    expect(chain).toHaveValue("ETH-SEPOLIA");
    expect(screen.getByText("Available: 125.50 USDC")).toBeInTheDocument();
  });

  it("continues to fee preview confirm with destination, amount, fee, and chain", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<SendPage />);

    await user.type(
      screen.getByLabelText("Destination address"),
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    );
    await user.type(screen.getByLabelText("Amount (USDC)"), "10.00");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByLabelText("Transfer summary")).toBeInTheDocument();
    expect(
      screen.getByText("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
    ).toBeInTheDocument();
    expect(screen.getByText("10.00 USDC")).toBeInTheDocument();
    expect(screen.getByText("0.002 network fee")).toBeInTheDocument();
    expect(screen.getByText("Polygon Amoy")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm transfer" }),
    ).toHaveClass("rainbow-outline");
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it("confirms to success mock with transactions link and no API", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<SendPage />);

    await user.type(
      screen.getByLabelText("Destination address"),
      "0xcccccccccccccccccccccccccccccccccccccccc",
    );
    await user.type(screen.getByLabelText("Amount (USDC)"), "5.00");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Confirm transfer" }));

    expect(screen.getByLabelText("Transfer submitted")).toBeInTheDocument();
    expect(screen.getByText("Transfer submitted")).toBeInTheDocument();
    const txLink = screen.getByRole("link", { name: "View transactions" });
    expect(txLink).toHaveAttribute("href", "/transactions");
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it("uses white canvas layout without PageShell Stub", () => {
    const { container } = render(<SendPage />);

    expect(container.firstChild).toHaveClass("bg-white-canvas");
    expect(screen.queryByText("Stub")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });
});
