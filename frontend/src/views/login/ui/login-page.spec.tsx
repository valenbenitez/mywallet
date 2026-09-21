import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BRAND_NAME } from "@/shared/config/brand";
import { LoginPage } from "./login-page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

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

describe("LoginPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders email and password fields with Portrait input radius", () => {
    render(<LoginPage />);

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");

    expect(email).toHaveAttribute("type", "email");
    expect(password).toHaveAttribute("type", "password");
    expect(email).toHaveClass("rounded-[var(--radius-inputs)]");
    expect(password).toHaveClass("rounded-[var(--radius-inputs)]");
  });

  it("has one rainbow pill CTA and a link to register", () => {
    render(<LoginPage />);

    const submit = screen.getByRole("button", { name: "Sign in" });
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit).toHaveClass("rainbow-outline");
    expect(submit).toHaveClass("rounded-[var(--radius-buttons)]");
    expect(document.querySelectorAll(".rainbow-outline")).toHaveLength(1);

    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("mock submit navigates to dashboard without API calls", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "demo@mywallet.test");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("shows brand, Login heading, and custodial copy", () => {
    render(<LoginPage />);

    expect(screen.getByText(BRAND_NAME)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Login" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/custodial account/i),
    ).toBeInTheDocument();
  });
});
