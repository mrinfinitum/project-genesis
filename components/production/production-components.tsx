import Link from "next/link";
import { ArrowRight, Box, FileText, Layers3 } from "lucide-react";
import { ProductionCopyButton } from "@/components/production/copy-button";
import { WorkspaceBadge } from "@/components/ui/workspace";
import type { ProductionCard } from "@/lib/production";

export function ProductionHeader({
  eyebrow = "Production",
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-black text-white">{title}</h1>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{description}</p>
    </section>
  );
}

export function ProductionCardGrid({ children }: { children: React.ReactNode }) {
  return <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{children}</section>;
}

export function ProductionNavCard({ card }: { card: ProductionCard }) {
  return (
    <article className="flex min-h-[13rem] flex-col rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 transition hover:border-cyan-300/45">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/15 bg-cyan-300/10">
          <Layers3 className="h-5 w-5 text-cyan-100" />
        </div>
        {card.status ? <WorkspaceBadge value={card.status} className="text-[0.55rem]" /> : null}
      </div>
      <h2 className="mt-4 text-xl font-black text-white">{card.title}</h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{card.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <ProductionCopyButton text={`${card.title}\n${card.description}\n${card.href}`} />
        <Link href={card.href} className="inline-flex items-center gap-2 rounded-md border border-slate-500/35 bg-slate-950/45 px-3 py-2 text-sm font-black text-slate-200 transition hover:border-cyan-200/45 hover:text-white">
          Open
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function ProductionReferenceCard({
  title,
  description,
  badge,
  copyText,
  href,
  children
}: {
  title: string;
  description: string;
  badge?: string;
  copyText: string;
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="flex min-h-[14rem] flex-col rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/15 bg-cyan-300/10">
          <FileText className="h-5 w-5 text-cyan-100" />
        </div>
        {badge ? <WorkspaceBadge value={badge} className="text-[0.55rem]" /> : null}
      </div>
      <h2 className="mt-4 text-xl font-black text-white">{title}</h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        <ProductionCopyButton text={copyText} />
        {href ? (
          <Link href={href} className="inline-flex items-center gap-2 rounded-md border border-slate-500/35 bg-slate-950/45 px-3 py-2 text-sm font-black text-slate-200 transition hover:border-cyan-200/45 hover:text-white">
            Open
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function ProductionSection({
  title,
  children,
  action
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-cyan-200" />
          <h2 className="text-xl font-black text-white">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
