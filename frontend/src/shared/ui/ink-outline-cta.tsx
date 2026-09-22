import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const inkOutlineClasses =
  "inline-flex items-center justify-center rounded-[var(--radius-buttons)] border-[1.5px] border-portrait-ink bg-transparent px-[var(--spacing-16)] py-[10px] font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink transition-opacity hover:opacity-70";

type InkOutlineLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

type InkOutlineButtonProps = {
  href?: undefined;
  children: ReactNode;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

type InkOutlineCtaProps = InkOutlineLinkProps | InkOutlineButtonProps;

/** Secondary action: transparent fill + Portrait Ink outline pill. Link or button. */
export function InkOutlineCta(props: InkOutlineCtaProps) {
  const className = `${inkOutlineClasses} ${props.className ?? ""}`.trim();

  if ("href" in props && props.href !== undefined) {
    return (
      <Link href={props.href} className={className}>
        {props.children}
      </Link>
    );
  }

  const { children, type = "button", onClick } = props;

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
}
