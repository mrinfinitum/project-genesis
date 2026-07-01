import { NextResponse } from "next/server";
import { getStudioAccess } from "@/lib/auth/permissions";
import { createSupabaseAdminClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(_request: Request, { params }: Params) {
  const access = await getStudioAccess();

  if (!access.user) {
    return jsonError("Authentication required.", 401);
  }

  if (!access.isAdmin) {
    return jsonError("Admin access required.", 403);
  }

  if (!hasSupabaseServerConfig()) {
    return jsonError("Supabase service role is not configured.", 503);
  }

  const { id } = await params;

  if (!id) {
    return jsonError("User ID is required.", 400);
  }

  if (id === access.user.id) {
    return jsonError("You cannot delete your own active account.", 400);
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    return jsonError(error.message, 400);
  }

  return NextResponse.json({ ok: true });
}
