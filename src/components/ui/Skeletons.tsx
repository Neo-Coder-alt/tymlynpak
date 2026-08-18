export function ProductCardSkeleton() {
  return (
    <div className="group">
      <div className="aspect-square skeleton rounded-lg" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
        <div className="h-4 w-1/3 skeleton rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin ${className}`}
      style={{ width: '1.25rem', height: '1.25rem' }}
    />
  );
}

export function CenterSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner className="!w-8 !h-8" />
      {label && <p className="text-sm text-zinc-400">{label}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-zinc-600 mb-4">{icon}</div>}
      <h3 className="text-xl text-zinc-300">{title}</h3>
      {message && <p className="text-sm text-zinc-500 mt-2 max-w-sm">{message}</p>}
    </div>
  );
}
