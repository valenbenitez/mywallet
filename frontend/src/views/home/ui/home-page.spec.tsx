import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BRAND_NAME } from "@/shared/config/brand";
import { HomePage } from "./home-page";

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

describe("HomePage", () => {
  it("renders full landing with floating nav, hero, and at most two calm sections", () => {
    render(<HomePage />);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByText(BRAND_NAME).length).toBeGreaterThanOrEqual(1);

    expect(
      screen.getByRole("link", { name: /^Login$/ }),
    ).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveClass(
      "rainbow-outline",
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /A wallet without the keys forever/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute(
      "href",
      "/register",
    );

    expect(screen.getByTestId("pointer-spotlight")).toHaveClass(
      "pointer-spotlight",
    );

    const sections = screen.getAllByRole("region");
    // hero + ≤2 calm content sections
    expect(sections.length).toBeLessThanOrEqual(3);
    expect(sections.length).toBeGreaterThanOrEqual(1);

    expect(
      screen.queryByRole("link", { name: "Dashboard" }),
    ).not.toBeInTheDocument();
  });
});
