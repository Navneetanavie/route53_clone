"use client";

import { forwardRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ value, onChange, placeholder = "Filter by name" }, ref) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--aws-text-secondary)]">
          🔍
        </span>
        <input
          ref={ref}
          type="text"
          data-search-input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full max-w-xs pl-9 pr-3 py-1.5 text-sm border border-[var(--aws-border)] rounded bg-[var(--aws-card)] text-[var(--aws-text)] focus:outline-none focus:ring-1 focus:ring-[var(--aws-blue)] focus:border-[var(--aws-blue)]"
        />
      </div>
    );
  },
);
