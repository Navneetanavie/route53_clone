"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--aws-orange)] hover:bg-[var(--aws-orange-hover)] text-black border border-[#c45500]",
  secondary:
    "bg-white hover:bg-gray-50 text-[var(--aws-text)] border border-[var(--aws-border)]",
  danger:
    "bg-[#d13212] hover:bg-[#ba2e0f] text-white border border-[#ba2e0f]",
  link: "bg-transparent text-[var(--aws-blue)] hover:text-[var(--aws-blue-hover)] border-none underline-offset-2 hover:underline p-0",
};

export function Button({
  variant = "secondary",
  loading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full spinner" />
      )}
      {children}
    </button>
  );
}
