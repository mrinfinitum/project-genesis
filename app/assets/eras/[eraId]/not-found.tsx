import Link from "next/link";

export default function EraArtInventoryNotFound() {
  return (
    <main className="min-h-screen bg-[#020817] px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Era Art Inventory</p>
        <h1 className="mt-3 text-3xl font-black text-white">Era Not Found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This era art inventory route does not match a canonical Project Genesis era.
        </p>
        <Link href="/civilizations#full-civilization-timeline" className="mt-5 inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
          Return to Civilization Timeline
        </Link>
      </section>
    </main>
  );
}
