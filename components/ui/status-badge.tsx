import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Ready: "border-green-300/30 bg-green-300/10 text-green-200",
  "In Progress": "border-blue-300/30 bg-blue-300/10 text-blue-200",
  Draft: "border-slate-300/30 bg-slate-300/10 text-slate-200",
  Blocked: "border-red-300/30 bg-red-300/10 text-red-200",
  Deprecated: "border-amber-300/30 bg-amber-300/10 text-amber-200"
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", styles[value] ?? styles.Draft)}>
      {value}
    </span>
  );
}
