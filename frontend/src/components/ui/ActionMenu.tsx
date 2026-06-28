"use client";

import { useEffect, useRef, useState } from "react";

interface ActionMenuProps {
  items: { label: string; onClick: () => void; danger?: boolean }[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="px-2 py-1 text-[var(--aws-text-secondary)] hover:bg-gray-100 rounded"
        aria-label="Actions"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--aws-card)] border border-[var(--aws-border)] rounded shadow-lg min-w-[120px] py-1">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                item.danger ? "text-[#d13212]" : "text-[var(--aws-text)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
