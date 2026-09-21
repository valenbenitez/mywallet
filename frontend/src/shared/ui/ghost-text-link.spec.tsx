import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { GhostTextLink } from "./ghost-text-link";

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

describe("GhostTextLink", () => {
  it("renders a borderless text link to the given href", () => {
    render(<GhostTextLink href="/login">Login</GhostTextLink>);

    const link = screen.getByRole("link", { name: "Login" });
    expect(link).toHaveAttribute("href", "/login");
    expect(link).toHaveClass("font-switzer", "text-portrait-ink");
    expect(link.className).not.toMatch(/border|rainbow-outline/);
  });
});
