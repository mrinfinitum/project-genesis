import { AccountSecurityPanel } from "@/components/auth/account-security-panel";
import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";
import { UserManagementPanel } from "@/components/auth/user-management-panel";
import { getStudioAccess } from "@/lib/auth/permissions";

export default async function SettingsPage() {
  const access = await getStudioAccess();

  return (
    <div className="space-y-6">
      <ReferenceScreenWorkflow
        featureId="settings"
        assetsHref="/asset-library?screen=settings"
        componentsHref="/component-library?screen=settings"
        handoffHref="/screen-designer/settings#handoff"
        screenSpecHref="/screen-designer/settings"
      />
      <AccountSecurityPanel />
      {access.isAdmin ? (
        <div id="users">
          <UserManagementPanel />
        </div>
      ) : null}
    </div>
  );
}
