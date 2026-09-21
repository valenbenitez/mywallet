import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BRAND_NAME } from "@/shared/config/brand";
import { AuthPageShell } from "./auth-page-shell";

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

describe("AuthPageShell", () => {
  it("centers a calm auth column with FloatingPillNav and no Stub badge", () => {
    const { container } = render(
      <AuthPageShell title="Login" description="Custodial copy">
        <p>form</p>
      </AuthPageShell>,
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(
      "flex",
      "min-h-full",
      "flex-1",
      "flex-col",
      "bg-white-canvas",
    );

    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
    expect(screen.getByText(BRAND_NAME)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/register",
    );

    const column = root.children[1] as HTMLElement;
    expect(column).toHaveClass(
      "mx-auto",
      "flex",
      "w-full",
      "max-w-[420px]",
      "flex-1",
      "flex-col",
      "justify-center",
    );

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.queryByText("Stub")).not.toBeInTheDocument();
  });
});
