export function Skeleton({ className = '' }) {
  return <div className={`fc-skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="fc-glass-card p-5 space-y-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}