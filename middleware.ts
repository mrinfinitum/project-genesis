import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const authPaths = ["/login", "/auth/mfa", "/auth/setup-2fa", "/auth/update-password"];

function hasSupabaseAuthConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function isMfaRequired() {
  return process.env.REQUIRE_MFA === "true" || process.env.NEXT_PUBLIC_REQUIRE_MFA === "true";
}

function isAuthPath(pathname: string) {
  return authPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

function exportTokenAllows(request: NextRequest) {
  const token = process.env.PROJECT_GENESIS_EXPORT_TOKEN;

  if (!token || !request.nextUrl.pathname.startsWith("/api/export")) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${token}`;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasSupabaseAuthConfig() || exportTokenAllows(request)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    if (isApiPath(pathname)) {
      return jsonError("Authentication required.", 401);
    }

    if (isAuthPath(pathname)) {
      return response;
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (isMfaRequired()) {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(session?.access_token);
    const needsMfa = aalData?.currentLevel !== "aal2";

    if (needsMfa && !isAuthPath(pathname)) {
      if (isApiPath(pathname)) {
        return jsonError("Two-factor authentication required.", 403);
      }

      const mfaUrl = request.nextUrl.clone();
      mfaUrl.pathname = aalData?.nextLevel === "aal2" ? "/auth/mfa" : "/auth/setup-2fa";
      mfaUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(mfaUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
