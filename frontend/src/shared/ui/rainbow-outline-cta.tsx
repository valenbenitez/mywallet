import Link from "next/link";
import type { ReactNode } from "react";

type RainbowOutlineCtaProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Primary action: transparent fill + 1.5px rainbow gradient border (DESIGN.md). */
export function RainbowOutlineCta({
  href,
  children,
  className = "",
}: RainbowOutlineCtaProps) {
  return (
    <Link
      href={href}
      className={`rainbow-outline inline-flex items-center justify-center rounded-[var(--radius-buttons)] px-[var(--spacing-16)] py-[10px] font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink transition-opacity hover:opacity-90 ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
