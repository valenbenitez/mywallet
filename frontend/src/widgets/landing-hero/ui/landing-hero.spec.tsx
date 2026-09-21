import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BRAND_TAGLINE } from "@/shared/config/brand";
import { LandingHero, RAINBOW_WORD } from "./landing-hero";

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

describe("LandingHero", () => {
  it("renders Basier display headline with one rainbow italic word and register CTA", () => {
    render(<LandingHero />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("font-basier-circle");
    expect(heading).toHaveTextContent(/A wallet without the keys/);

    const rainbowWord = screen.getByText(RAINBOW_WORD);
    expect(rainbowWord.tagName).toBe("EM");
    expect(rainbowWord).toHaveClass(
      "rainbow-text-fill",
      "inline-block",
      "ps-[0.06em]",
      "pe-[0.18em]",
      "italic",
    );

    expect(screen.getByText(BRAND_TAGLINE)).toHaveClass("font-switzer");

    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute(
      "href",
      "/register",
    );
  });
});
