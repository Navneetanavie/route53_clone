export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-3 border-[var(--aws-orange)] border-t-transparent rounded-full spinner" />
      <span className="text-sm text-[var(--aws-text-secondary)]">{label}</span>
    </div>
  );
}
