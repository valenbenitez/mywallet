import Link from "next/link";
import { BRAND_NAME } from "@/shared/config/brand";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";

/** Sticky white pill nav: wordmark + Login ghost + Sign up rainbow outline. */
export function FloatingPillNav() {
  return (
    <div className="sticky top-[var(--spacing-16)] z-50 px-[var(--spacing-16)] sm:px-[var(--spacing-20)]">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[56px] w-full max-w-[var(--page-max-width)] items-center justify-between gap-[var(--spacing-12)] rounded-[var(--radius-nav)] bg-[var(--surface-sticky-nav)] px-[var(--spacing-20)] shadow-[var(--shadow-md)]"
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-[var(--spacing-8)] font-switzer text-[length:var(--text-body)] font-semibold tracking-[0.025em] text-portrait-ink"
        >
          <span
            aria-hidden
            className="rainbow-swatch size-[10px] shrink-0 rounded-[2px]"
          />
          <span className="truncate">{BRAND_NAME}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-[var(--spacing-12)] sm:gap-[var(--spacing-16)]">
          <GhostTextLink
            href="/login"
            className="text-[length:var(--text-body)] max-sm:text-[length:var(--text-body)]"
          >
            Login
          </GhostTextLink>
          <RainbowOutlineCta href="/register">Sign up</RainbowOutlineCta>
        </div>
      </nav>
    </div>
  );
}
