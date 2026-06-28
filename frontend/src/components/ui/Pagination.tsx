"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--aws-border)] bg-[var(--aws-card)] text-sm">
      <span className="text-[var(--aws-text-secondary)]">
        {start}-{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 border border-[var(--aws-border)] rounded disabled:opacity-40 hover:bg-gray-50"
        >
          ‹
        </button>
        <span className="px-2 text-[var(--aws-text-secondary)]">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 border border-[var(--aws-border)] rounded disabled:opacity-40 hover:bg-gray-50"
        >
          ›
        </button>
      </div>
    </div>
  );
}
