import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(link).toHaveClass("rounded-[var(--radius-buttons)]");
  });

  it("renders a submit button with pill radius and rainbow outline", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <RainbowOutlineCta type="submit" onClick={onClick}>
        Sign in
      </RainbowOutlineCta>,
    );

    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("rainbow-outline");
    expect(button).toHaveClass("rounded-[var(--radius-buttons)]");

    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
