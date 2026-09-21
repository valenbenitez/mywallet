import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { RainbowOutlineCta } from "./rainbow-outline-cta";

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

describe("RainbowOutlineCta", () => {
  it("links with rainbow-outline class to the given href", () => {
    render(<RainbowOutlineCta href="/register">Sign up</RainbowOutlineCta>);

    const link = screen.getByRole("link", { name: "Sign up" });
    expect(link).toHaveAttribute("href", "/register");
    expect(link).toHaveClass("rainbow-outline");
  });
});
