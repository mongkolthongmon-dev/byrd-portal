export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
      <div className="h-10 animate-pulse rounded bg-slate-200" />
      <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}
