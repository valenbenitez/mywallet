import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMockDepositAddress, mockWallet } from "@/entities/wallet";
import { BRAND_NAME } from "@/shared/config/brand";
import { ReceivePage } from "./receive-page";

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
  usePathname: () => "/receive",
}));

describe("ReceivePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders AppNav, Receive heading, chain tabs, and Portrait layout", () => {
    render(<ReceivePage />);

    expect(screen.getByRole("navigation", { name: "App" })).toBeInTheDocument();
    expect(screen.getAllByText(BRAND_NAME).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "Receive" })).toBeInTheDocument();
    expect(screen.queryByText("Stub")).not.toBeInTheDocument();

    expect(screen.getByRole("tab", { name: "Polygon Amoy" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("tab", { name: "Ethereum Sepolia" }),
    ).toHaveAttribute("aria-selected", "false");
  });

  it("shows full Amoy address, QR, and testnet hint by default", () => {
    const amoy = getMockDepositAddress("MATIC-AMOY", mockWallet);
    render(<ReceivePage />);

    expect(screen.getByTestId("receive-address")).toHaveTextContent(amoy);
    expect(amoy).toHaveLength(42);
    expect(screen.queryByText(/0x1111…1111/)).not.toBeInTheDocument();

    const qr = screen.getByTestId("receive-qr");
    expect(qr).toHaveAttribute("data-address", amoy);
    expect(qr).toHaveAttribute("aria-label", `QR code for ${amoy}`);

    expect(
      screen.getByText("Send only testnet USDC on Polygon Amoy."),
    ).toBeInTheDocument();
  });

  it("switches to Sepolia address and QR", async () => {
    const user = userEvent.setup();
    const sepolia = getMockDepositAddress("ETH-SEPOLIA", mockWallet);
    render(<ReceivePage />);

    await user.click(screen.getByRole("tab", { name: "Ethereum Sepolia" }));

    expect(
      screen.getByRole("tab", { name: "Ethereum Sepolia" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("receive-address")).toHaveTextContent(sepolia);
    expect(screen.getByTestId("receive-qr")).toHaveAttribute(
      "data-address",
      sepolia,
    );
    expect(
      screen.getByText("Send only testnet USDC on Ethereum Sepolia."),
    ).toBeInTheDocument();
  });

  it("copies the active address with a single primary CTA and no API", async () => {
    const user = userEvent.setup();
    const amoy = getMockDepositAddress("MATIC-AMOY", mockWallet);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText },
    });
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<ReceivePage />);

    const copyButton = screen.getByRole("button", { name: "Copy address" });
    expect(copyButton).toHaveClass("rainbow-outline");
    expect(
      screen.queryAllByRole("button").filter((el) =>
        el.className.includes("rainbow-outline"),
      ),
    ).toHaveLength(1);

    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith(amoy);
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("uses white canvas layout without PageShell Stub", () => {
    const { container } = render(<ReceivePage />);

    expect(container.firstChild).toHaveClass("bg-white-canvas");
    expect(screen.queryByText("Stub")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Primary" }),
    ).not.toBeInTheDocument();
  });
});
