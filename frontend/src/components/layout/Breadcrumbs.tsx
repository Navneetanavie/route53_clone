"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="text-sm text-[var(--aws-text-secondary)] mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1">›</span>}
          {item.href ? (
            <Link href={item.href} className="text-[var(--aws-blue)] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--aws-text)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
