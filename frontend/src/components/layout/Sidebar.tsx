"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Hosted zones", href: "/hosted-zones" },
  { label: "Traffic policies", href: "/traffic-policies" },
  { label: "Health checks", href: "/health-checks" },
  { label: "Resolver", href: "/resolver" },
  { label: "Profiles", href: "/profiles" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-[48px] bottom-0 w-[var(--aws-sidebar-width)] bg-[var(--aws-dark)] text-white overflow-y-auto z-30"
      style={{ width: "var(--aws-sidebar-width)" }}
    >
      <div className="px-4 py-3 border-b border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-white/70">
          Route 53
        </span>
      </div>
      <nav className="py-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-sm border-l-4 ${
                active
                  ? "border-[var(--aws-orange)] bg-white/10 text-white font-medium"
                  : "border-transparent text-white/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
