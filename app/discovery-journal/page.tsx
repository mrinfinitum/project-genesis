import { GeneratedUniverseLibrary } from "@/components/generated-universe-library";
import { getUniverseLibraryRecords } from "@/lib/universe/library";

export const dynamic = "force-dynamic";

const journalPageSize = 120;

type DiscoveryJournalSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DiscoveryLibraryPage({ searchParams }: { searchParams?: DiscoveryJournalSearchParams }) {
  const params = await searchParams;
  const requestedPage = Number(Array.isArray(params?.page) ? params.page[0] : params?.page);
  const records = getUniverseLibraryRecords("discoveries");
  const pageCount = Math.max(1, Math.ceil(records.length / journalPageSize));
  const currentPage = Number.isFinite(requestedPage) ? Math.min(pageCount, Math.max(1, Math.floor(requestedPage))) : 1;
  const pageRecords = records.slice((currentPage - 1) * journalPageSize, currentPage * journalPageSize);

  return (
    <GeneratedUniverseLibrary
      kind="discoveries"
      title="Discovery Journal"
      description="Browse discovery journal records and exploration history references that can be linked back to canonical curiosity definitions."
      generateLabel="Generate Journal Entry"
      records={pageRecords}
      emptyMessage="No discovery journal records yet."
      totalRecords={records.length}
      currentPage={currentPage}
      pageCount={pageCount}
      pageHref="/discovery-journal"
    />
  );
}
