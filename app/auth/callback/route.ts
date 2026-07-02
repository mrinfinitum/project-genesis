import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseCookieClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function redirectTo(request: NextRequest, path: string, error?: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";

  if (error) {
    url.searchParams.set("error_description", error);
  }

  return NextResponse.redirect(url);
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const urlError = request.nextUrl.searchParams.get("error_description") || request.nextUrl.searchParams.get("error");

  if (urlError) {
    return redirectTo(request, next, urlError);
  }

  try {
    const supabase = await createSupabaseCookieClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return redirectTo(request, next, error.message);
      }
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email"
      });

      if (error) {
        return redirectTo(request, next, error.message);
      }
    }

    return redirectTo(request, next);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not complete authentication callback.";
    return redirectTo(request, next, message);
  }
}
