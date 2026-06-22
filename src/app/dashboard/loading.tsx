export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
