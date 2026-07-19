import { AccountSecurityPanel } from "@/components/auth/account-security-panel";
import { UserManagementPanel } from "@/components/auth/user-management-panel";
import { getStudioAccess } from "@/lib/auth/permissions";

export default async function SettingsPage() {
  const access = await getStudioAccess();

  return (
    <div className="space-y-6">
      <AccountSecurityPanel />
      {access.isAdmin ? (
        <div id="users">
          <UserManagementPanel />
        </div>
      ) : null}
    </div>
  );
}
