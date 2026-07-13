function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md border border-cyan-300/10 bg-slate-950/55 ${className}`} />;
}

export default function CivilizationsLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 shadow-glow">
        <div className="max-w-2xl">
          <div className="h-3 w-44 animate-pulse rounded bg-cyan-300/20" />
          <div className="mt-4 h-10 w-96 max-w-full animate-pulse rounded bg-slate-700/55" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-800/80" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-800/80" />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <SkeletonBlock key={index} className="h-28" />)}
        </div>
      </section>
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-700/55" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <SkeletonBlock key={index} className="h-72" />)}
        </div>
      </section>
    </div>
  );
}
