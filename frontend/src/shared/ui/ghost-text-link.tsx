import Link from "next/link";
import type { ReactNode } from "react";

type GhostTextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Secondary action: no background/border — Login and quiet inline links. */
export function GhostTextLink({
  href,
  children,
  className = "",
}: GhostTextLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink transition-opacity hover:opacity-70 ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
