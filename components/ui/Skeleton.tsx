export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-[var(--surface-2)] ${className}`} />
);

export const PostSkeleton = () => (
  <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-4 w-40" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-56 w-full" />
  </div>
);
