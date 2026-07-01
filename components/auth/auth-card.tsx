import { Cpu } from "lucide-react";

export function AuthCard({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="genesis-grid flex min-h-screen items-center justify-center bg-genesis-void px-5 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-md border border-cyan-300/20 bg-[#07101e]/95 p-6 shadow-glow backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/35 bg-cyan-300/10">
            <Cpu className="h-5 w-5 text-cyan-200" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>
        </div>
        <p className="mb-6 text-sm leading-6 text-slate-300">{description}</p>
        {children}
      </section>
    </main>
  );
}

