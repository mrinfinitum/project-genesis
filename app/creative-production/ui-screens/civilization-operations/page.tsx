import { CivilizationOperationsWorkspace } from "@/components/civilization-operations-workspace";
import { civilizationOperationsDeckContract } from "@/lib/assets/civilization-operations-deck";
import { auditCivilizationOperationsSources } from "@/lib/assets/civilization-operations-deck-server";

export const dynamic = "force-dynamic";

export default async function CivilizationOperationsPage() {
  return (
    <CivilizationOperationsWorkspace
      contract={civilizationOperationsDeckContract}
      audit={await auditCivilizationOperationsSources()}
    />
  );
}
