export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-[var(--muted)]">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--muted)] border-t-transparent" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
