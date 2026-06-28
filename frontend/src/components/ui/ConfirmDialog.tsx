"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  loading,
  danger = true,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24">
      <div className="bg-[var(--aws-card)] rounded shadow-lg border border-[var(--aws-border)] w-[480px] max-w-[95vw]">
        <div className="px-6 py-4 border-b border-[var(--aws-border)]">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="px-6 py-4 text-sm text-[var(--aws-text-secondary)]">{message}</div>
        <div className="px-6 py-4 border-t border-[var(--aws-border)] flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm border border-[var(--aws-border)] rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-1.5 text-sm rounded text-white disabled:opacity-50 ${
              danger
                ? "bg-[#d13212] hover:bg-[#ba2e0f] border border-[#ba2e0f]"
                : "bg-[var(--aws-orange)] hover:bg-[var(--aws-orange-hover)] border border-[#c45500] text-black"
            }`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
