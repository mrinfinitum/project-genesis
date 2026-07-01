import { createSupabaseCookieClient } from "@/lib/supabase/server";

export type StudioRole = "admin" | "member";

type AuthUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
};

function configuredAdminEmails() {
  return (process.env.PROJECT_GENESIS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function studioRoleForUser(user: AuthUser | null | undefined): StudioRole {
  const role = String(user?.app_metadata?.role ?? "").toLowerCase();

  if (role === "admin") {
    return "admin";
  }

  const email = user?.email?.toLowerCase();

  if (email && configuredAdminEmails().includes(email)) {
    return "admin";
  }

  return "member";
}

export async function getCurrentStudioUser() {
  const supabase = await createSupabaseCookieClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getStudioAccess() {
  const user = await getCurrentStudioUser();
  const role = studioRoleForUser(user);

  return {
    user,
    role,
    isAdmin: role === "admin"
  };
}
