import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BRAND_NAME } from "@/shared/config/brand";
import { RegisterPage } from "./register-page";

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

describe("RegisterPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders email, password, and confirm fields with Portrait input radius", () => {
    render(<RegisterPage />);

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    const confirm = screen.getByLabelText("Confirm password");

    expect(email).toHaveAttribute("type", "email");
    expect(password).toHaveAttribute("type", "password");
    expect(confirm).toHaveAttribute("type", "password");
    expect(email).toHaveClass("rounded-[var(--radius-inputs)]");
    expect(password).toHaveClass("rounded-[var(--radius-inputs)]");
    expect(confirm).toHaveClass("rounded-[var(--radius-inputs)]");
  });

  it("has one rainbow pill CTA and a link to login", () => {
    render(<RegisterPage />);

    const submit = screen.getByRole("button", { name: "Create account" });
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit).toHaveClass("rainbow-outline");
    expect(submit).toHaveClass("rounded-[var(--radius-buttons)]");
    expect(document.querySelectorAll(".rainbow-outline")).toHaveLength(1);

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("mock submit navigates to dashboard without API calls", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Email"), "demo@mywallet.test");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.type(screen.getByLabelText("Confirm password"), "password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("shows brand, Register heading, and custodial wallet copy", () => {
    render(<RegisterPage />);

    expect(screen.getByText(BRAND_NAME)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Register" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/virtual custodial wallet/i),
    ).toBeInTheDocument();
  });
});
