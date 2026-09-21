import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BRAND_NAME } from "@/shared/config/brand";
import { FloatingPillNav } from "./floating-pill-nav";

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

describe("FloatingPillNav", () => {
  it("shows My Wallet wordmark with Login ghost and Sign up rainbow CTA", () => {
    render(<FloatingPillNav />);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toHaveClass("rounded-[var(--radius-nav)]", "shadow-[var(--shadow-md)]");
    expect(screen.getByText(BRAND_NAME)).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );

    const signUp = screen.getByRole("link", { name: "Sign up" });
    expect(signUp).toHaveAttribute("href", "/register");
    expect(signUp).toHaveClass("rainbow-outline");
  });
});
