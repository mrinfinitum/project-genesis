function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md border border-cyan-300/10 bg-slate-950/55 ${className}`} />;
}

export default function EraArtInventoryLoading() {
  return (
    <main className="space-y-6">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 shadow-glow">
        <div className="h-3 w-44 animate-pulse rounded bg-cyan-300/20" />
        <div className="mt-4 h-10 w-80 max-w-full animate-pulse rounded bg-slate-700/55" />
        <div className="mt-4 h-4 w-full max-w-3xl animate-pulse rounded bg-slate-800/80" />
      </section>
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, index) => <SkeletonBlock key={index} className="h-20" />)}
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <SkeletonBlock key={index} className="h-96" />)}
      </section>
    </main>
  );
}
