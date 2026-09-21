import type { InputHTMLAttributes } from "react";

type AuthTextFieldProps = {
  id: string;
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

/** Portrait form field: 16px radius, Fog Edge stroke (DESIGN.md — not domain-search pill). */
export function AuthTextField({ id, label, ...inputProps }: AuthTextFieldProps) {
  return (
    <div className="flex flex-col gap-[var(--spacing-8)]">
      <label
        htmlFor={id}
        className="font-switzer text-[length:var(--text-body)] font-medium text-portrait-ink"
      >
        {label}
      </label>
      <input
        id={id}
        className="rounded-[var(--radius-inputs)] border border-fog-edge bg-white-canvas px-[var(--spacing-16)] py-[12px] font-switzer text-[length:var(--text-body)] text-portrait-ink outline-none placeholder:text-slate-helper focus:border-charcoal-outline"
        {...inputProps}
      />
    </div>
  );
}
