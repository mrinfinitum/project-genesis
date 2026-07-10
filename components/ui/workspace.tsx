import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function workspaceBadgeClass(value: string) {
  if (/critical|failed|expired|abandoned|blocked|shortage|hostile|hard|extreme|legendary|pirate|volatile|high/i.test(value)) {
    return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  }
  if (/complete|completed|accepted|active|ready|friendly|surplus|easy|trivial|secure|low/i.test(value)) {
    return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  }
  if (/moderate|available|uncommon|rare|limited|rising|planned|building|paused|warning/i.test(value)) {
    return "border-amber-300/35 bg-amber-400/10 text-amber-100";
  }
  return "border-cyan-300/35 bg-cyan-400/10 text-cyan-100";
}

export function WorkspaceBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em]", workspaceBadgeClass(value), className)}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function WorkspaceStatTile({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={cn("rounded-md border border-cyan-300/10 bg-slate-950/45 p-4", className)}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export function WorkspaceMiniStat({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={cn("rounded-md border border-cyan-300/10 bg-slate-950/45 p-3", className)}>
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-100">{value}</p>
    </div>
  );
}

export function WorkspaceProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-900", className)}>
      <div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function WorkspacePanel({ title, children, icon: Icon, className }: { title?: string; children: React.ReactNode; icon?: LucideIcon; className?: string }) {
  return (
    <section className={cn("rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow", className)}>
      {title ? (
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5 text-cyan-200" /> : null}
          <h3 className="text-lg font-black text-white">{title}</h3>
        </div>
      ) : null}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  stats
}: {
  eyebrow: string;
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string | number }>;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_28rem]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-white">{title}</h1>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">{description}</p>
      </div>
      {stats?.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <WorkspaceStatTile key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function WorkspaceSearchBar({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3", className)}>
      <Search className="h-4 w-4 text-slate-500" />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder={placeholder} />
    </div>
  );
}

export function WorkspaceTabs<T extends string>({ tabs, active, onChange, labels }: { tabs: T[]; active: T; onChange: (tab: T) => void; labels?: Partial<Record<T, string>> }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-2">
      {tabs.map((item) => (
        <button key={item} type="button" onClick={() => onChange(item)} className={cn("rounded-md px-3 py-2 text-sm font-bold capitalize transition", active === item ? "bg-cyan-300/20 text-white" : "text-slate-400 hover:bg-cyan-300/10 hover:text-slate-100")}>
          {labels?.[item] ?? item.replaceAll("_", " ")}
        </button>
      ))}
    </div>
  );
}
