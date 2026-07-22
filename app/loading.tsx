import { LoaderCircle } from "lucide-react";

export default function StudioLoading() {
  return (
    <main className="grid min-h-[calc(100vh-5rem)] place-items-center" aria-busy="true" aria-label="Loading Studio workspace">
      <div className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 text-sm font-bold text-slate-300 shadow-glow">
        <LoaderCircle className="h-4 w-4 animate-spin text-cyan-200" aria-hidden="true" />
        Loading workspace
      </div>
    </main>
  );
}
