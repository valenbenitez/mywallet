import type { ReactNode } from "react";
import { BRAND_NAME } from "@/shared/config/brand";
import { AppNav } from "@/widgets/app-nav/ui/app-nav";

type WalletAppShellProps = {
  title: string;
  children: ReactNode;
  /** Hide the page title block (e.g. dashboard uses a balance hero instead). */
  hideTitle?: boolean;
};

/**
 * Shared post-login shell: white canvas, narrow app column, top brand, floating pill nav.
 */
export function WalletAppShell({
  title,
  children,
  hideTitle = false,
}: WalletAppShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white-canvas text-portrait-ink">
      <header className="mx-auto flex w-full max-w-[480px] items-center gap-[var(--spacing-8)] px-[var(--spacing-20)] pt-[var(--spacing-20)] sm:max-w-[520px]">
        <span
          aria-hidden
          className="rainbow-swatch size-[10px] shrink-0 rounded-[2px]"
        />
        <p className="font-switzer text-[length:var(--text-body)] font-semibold tracking-[0.025em] text-portrait-ink">
          {BRAND_NAME}
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-[var(--spacing-28)] px-[var(--spacing-20)] pb-[calc(56px+var(--spacing-40)+var(--spacing-16))] pt-[var(--spacing-24)] sm:max-w-[520px]">
        {hideTitle ? (
          <h1 className="sr-only">{title}</h1>
        ) : (
          <header className="flex flex-col gap-[var(--spacing-8)]">
            <p className="font-switzer text-[length:var(--text-caption)] font-semibold uppercase tracking-[0.14em] text-slate-helper">
              {BRAND_NAME}
            </p>
            <h1 className="font-basier-circle text-[length:var(--text-heading-sm)] font-semibold leading-[var(--leading-heading-sm)] tracking-[var(--tracking-heading-sm)]">
              {title}
            </h1>
          </header>
        )}
        {children}
      </main>

      <AppNav />
    </div>
  );
}
