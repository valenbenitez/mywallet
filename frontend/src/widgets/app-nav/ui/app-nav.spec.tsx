import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BRAND_NAME } from "@/shared/config/brand";
import { AppNav } from "./app-nav";

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

describe("AppNav", () => {
  it("shows floating pill post-login links without a rainbow CTA", () => {
    render(<AppNav />);

    const nav = screen.getByRole("navigation", { name: "App" });
    expect(nav).toHaveClass(
      "rounded-[var(--radius-nav)]",
      "shadow-[var(--shadow-md)]",
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Receive" })).toHaveAttribute(
      "href",
      "/receive",
    );
    expect(screen.getByRole("link", { name: "Send" })).toHaveAttribute(
      "href",
      "/send",
    );
    expect(screen.getByRole("link", { name: "Transactions" })).toHaveAttribute(
      "href",
      "/transactions",
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(nav.querySelector(".rainbow-outline")).toBeNull();
    expect(screen.queryByText(BRAND_NAME)).not.toBeInTheDocument();

    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign up" }),
    ).not.toBeInTheDocument();
  });
});
