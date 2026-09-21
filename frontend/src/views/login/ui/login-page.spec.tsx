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

  it("has FloatingPillNav and a form rainbow CTA plus links to register", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: "Sign in" });
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit).toHaveClass("rainbow-outline");
    expect(submit).toHaveClass("rounded-[var(--radius-buttons)]");
    // Nav Sign up + form Sign in
    expect(document.querySelectorAll(".rainbow-outline")).toHaveLength(2);

    const signUpLinks = screen.getAllByRole("link", { name: "Sign up" });
    expect(signUpLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of signUpLinks) {
      expect(link).toHaveAttribute("href", "/register");
    }
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

  it("shows brand in nav, Login heading, and custodial copy", () => {
    render(<LoginPage />);

    expect(screen.getByText(BRAND_NAME)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Login" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/custodial account/i),
    ).toBeInTheDocument();
  });

  it("centers auth layout under FloatingPillNav and hides Stub badge", () => {
    const { container } = render(<LoginPage />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("flex", "min-h-full", "flex-1");

    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();

    const column = root.children[1] as HTMLElement;
    expect(column).toHaveClass(
      "mx-auto",
      "max-w-[420px]",
      "justify-center",
      "w-full",
    );

    expect(screen.queryByText("Stub")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveClass(
      "rounded-[var(--radius-inputs)]",
    );
  });
});


