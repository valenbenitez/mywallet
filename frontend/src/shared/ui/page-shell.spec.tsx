import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BRAND_NAME } from "@/shared/config/brand";
import { PageShell } from "./page-shell";

describe("PageShell", () => {
  it("renders My Wallet brand on white canvas layout", () => {
    const { container } = render(
      <PageShell title="Dashboard">
        <p>content</p>
      </PageShell>,
    );

    expect(screen.getByText(BRAND_NAME)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(
      "bg-white-canvas",
      "text-portrait-ink",
    );
  });
});
