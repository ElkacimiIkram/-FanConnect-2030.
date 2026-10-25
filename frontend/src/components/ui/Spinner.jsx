export default function Spinner({ label = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 animate-fade-in">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-primary-100" />
      </div>
      <span className="text-sm font-semibold text-ink-muted">{label}</span>
    </div>
  );
}