import type { ReactNode } from "react";
import { BRAND_NAME } from "@/shared/config/brand";

type PageShellProps = {
  title: string;
  children?: ReactNode;
};

/** Base layout: white canvas, Portrait Ink typography, My Wallet brand. */
export function PageShell({ title, children }: PageShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white-canvas text-portrait-ink">
      <header className="mx-auto flex w-full max-w-[var(--page-max-width)] items-center justify-between px-[var(--spacing-20)] py-[var(--spacing-16)]">
        <p className="font-switzer text-[length:var(--text-body)] font-semibold tracking-[0.025em]">
          {BRAND_NAME}
        </p>
        <p className="font-switzer text-[length:var(--text-caption)] font-medium uppercase tracking-[0.14em] text-slate-helper">
          Stub
        </p>
      </header>
      <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col gap-[var(--element-gap)] px-[var(--spacing-20)] pb-[var(--spacing-80)]">
        <h1 className="font-basier-circle text-[length:var(--text-heading-sm)] font-semibold leading-[var(--leading-heading-sm)] tracking-[var(--tracking-heading-sm)]">
          {title}
        </h1>
        {children}
      </main>
    </div>
  );
}
