import { NextResponse } from "next/server";
import { getStudioAccess, studioRoleForUser, type StudioRole } from "@/lib/auth/permissions";
import { createSupabaseAdminClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin() {
  const access = await getStudioAccess();

  if (!access.user) {
    return { error: jsonError("Authentication required.", 401) };
  }

  if (!access.isAdmin) {
    return { error: jsonError("Admin access required.", 403) };
  }

  if (!hasSupabaseServerConfig()) {
    return { error: jsonError("Supabase service role is not configured.", 503) };
  }

  return { access };
}

function normalizeRole(value: unknown): StudioRole {
  return value === "admin" ? "admin" : "member";
}

function serializeUser(user: {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string | null;
  app_metadata?: Record<string, unknown>;
}) {
  return {
    id: user.id,
    email: user.email ?? "",
    role: studioRoleForUser(user),
    created_at: user.created_at ?? "",
    last_sign_in_at: user.last_sign_in_at ?? null
  };
}

export async function GET() {
  const result = await requireAdmin();

  if ("error" in result) {
    return result.error;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100
  });

  if (error) {
    return jsonError(error.message, 500);
  }

  const currentUser = result.access.user;

  if (!currentUser) {
    return jsonError("Authentication required.", 401);
  }

  return NextResponse.json({
    current_user_id: currentUser.id,
    users: data.users.map(serializeUser).sort((left, right) => left.email.localeCompare(right.email))
  });
}

export async function POST(request: Request) {
  const result = await requireAdmin();

  if ("error" in result) {
    return result.error;
  }

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = normalizeRole(body.role);

  if (!email || !email.includes("@")) {
    return jsonError("A valid email is required.", 400);
  }

  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters.", 400);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role
    }
  });

  if (error) {
    return jsonError(error.message, 400);
  }

  return NextResponse.json({ user: data.user ? serializeUser(data.user) : null }, { status: 201 });
}
