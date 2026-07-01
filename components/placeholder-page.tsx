export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/95 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Phase 2 Module</p>
      <h2 className="mt-2 text-3xl font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-300">
        This section is reserved in the studio shell and will receive its dedicated schema and workflow after the Phase 1 data core is stable.
      </p>
    </div>
  );
}
