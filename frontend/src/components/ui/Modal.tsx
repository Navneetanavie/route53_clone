"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, footer, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-16">
      <div
        className={`bg-[var(--aws-card)] rounded shadow-lg border border-[var(--aws-border)] ${wide ? "w-[640px]" : "w-[480px]"} max-w-[95vw]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--aws-border)]">
          <h2 className="text-lg font-bold text-[var(--aws-text)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--aws-text-secondary)] hover:text-[var(--aws-text)] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--aws-border)] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
