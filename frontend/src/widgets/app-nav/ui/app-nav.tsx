"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  match?: (pathname: string) => boolean;
};

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReceiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v12m0 0-4-4m4 4 4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20V8m0 0-4 4m4-4 4 4M5 5h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 7v5l3 2m6-2a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const items: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <HomeIcon />,
    match: (p) => p === "/dashboard" || p === "/",
  },
  {
    href: "/receive",
    label: "Receive",
    icon: <ReceiveIcon />,
  },
  {
    href: "/send",
    label: "Send",
    icon: <SendIcon />,
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: <HistoryIcon />,
  },
];

/**
 * Post-login floating pill nav — bottom dock, wallet-app feel.
 * Distinct from landing FloatingPillNav (Login / Sign up). No rainbow CTA here
 * so each page can own a single primary rainbow action.
 */
export function AppNav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[var(--spacing-16)] z-50 flex justify-center px-[var(--spacing-16)]">
      <nav
        aria-label="App"
        className="pointer-events-auto flex h-[56px] w-full max-w-[480px] items-center justify-around rounded-[var(--radius-nav)] bg-[var(--surface-sticky-nav)] px-[var(--spacing-8)] shadow-[var(--shadow-md)] sm:max-w-[520px]"
      >
        {items.map((item) => {
          const active = item.match
            ? item.match(pathname)
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex size-11 items-center justify-center rounded-full text-portrait-ink transition-colors ${
                active ? "bg-sky-wash" : "hover:bg-mist-hairline"
              }`}
            >
              <span className="sr-only">{item.label}</span>
              {item.icon}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
