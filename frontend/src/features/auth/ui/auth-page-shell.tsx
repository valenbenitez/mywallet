import type { ReactNode } from "react";
import { FloatingPillNav } from "@/widgets/floating-pill-nav/ui/floating-pill-nav";

type AuthPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * Shared centered auth layout for /login and /register.
 * Floating pill nav (same as landing) + calm max-width column; no Stub badge.
 * Brand lives in the nav — body shows only title + description.
 */
export function AuthPageShell({
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white-canvas text-portrait-ink">
      <FloatingPillNav />
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-[var(--spacing-20)] pb-[var(--spacing-40)] pt-[var(--spacing-24)] sm:px-[var(--spacing-24)]">
        <h1 className="font-basier-circle text-[length:var(--text-heading-sm)] font-semibold leading-[var(--leading-heading-sm)] tracking-[var(--tracking-heading-sm)]">
          {title}
        </h1>
        <p className="mt-[var(--spacing-12)] font-switzer text-[length:var(--text-body)] text-slate-helper">
          {description}
        </p>
        <div className="mt-[var(--spacing-32)] flex w-full flex-col gap-[var(--spacing-24)]">
          {children}
        </div>
      </div>
    </div>
  );
}
