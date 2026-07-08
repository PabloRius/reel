export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <span className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
