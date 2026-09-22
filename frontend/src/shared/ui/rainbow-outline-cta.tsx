import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const rainbowOutlineClasses =
  "rainbow-outline inline-flex items-center justify-center rounded-[var(--radius-buttons)] px-[var(--spacing-16)] py-[10px] font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink transition-opacity hover:opacity-90";

type RainbowOutlineLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

type RainbowOutlineButtonProps = {
  href?: undefined;
  children: ReactNode;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  disabled?: boolean;
};

type RainbowOutlineCtaProps = RainbowOutlineLinkProps | RainbowOutlineButtonProps;

/** Primary action: transparent fill + 1.5px rainbow gradient border (DESIGN.md). Link or submit button. */
export function RainbowOutlineCta(props: RainbowOutlineCtaProps) {
  const className = `${rainbowOutlineClasses} ${props.className ?? ""}`.trim();

  if ("href" in props && props.href !== undefined) {
    return (
      <Link href={props.href} className={className}>
        {props.children}
      </Link>
    );
  }

  const { children, type = "button", onClick, disabled } = props;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${className}${disabled ? " opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}
