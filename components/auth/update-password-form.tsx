"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function readHashSession() {
    if (typeof window === "undefined" || !window.location.hash) {
      return null;
    }

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    return accessToken && refreshToken ? { access_token: accessToken, refresh_token: refreshToken } : null;
  }

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      const urlError = searchParams.get("error_description") || searchParams.get("error");

      if (urlError) {
        setError(urlError);
        return;
      }

      const code = searchParams.get("code");

      const hashSession = readHashSession();

      if (hashSession) {
        const { error: sessionError } = await supabase.auth.setSession(hashSession);

        if (!mounted) {
          return;
        }

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        router.replace("/auth/update-password");
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!mounted) {
          return;
        }

        if (exchangeError) {
          const message = exchangeError.message.includes("code verifier")
            ? "This password link was opened without its verifier. Request a new invite or reset link, then open it in the same browser where you requested it."
            : exchangeError.message;
          setError(message);
          return;
        }

        router.replace("/auth/update-password");
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        setError("Open the password reset link from your email, or request a new reset link from the login page.");
        return;
      }

      setReady(true);
    }

    prepareRecoverySession();

    return () => {
      mounted = false;
    };
  }, [router, searchParams, supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setComplete(true);
    setLoading(false);
  }

  return (
    <AuthCard
      eyebrow="Password Recovery"
      title="Set New Password"
      description="Choose a new studio password. After it is saved, return to login and sign in with 2FA."
    >
      {complete ? (
        <div className="space-y-4">
          <p className="flex items-center gap-2 rounded-md border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm text-green-100">
            <CheckCircle2 className="h-4 w-4" />
            Password updated.
          </p>
          <Button className="h-11 w-full" onClick={() => router.push("/login")} type="button">
            Back To Login
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-200">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">New Password</span>
            <input
              className="h-11 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!ready}
              required
            />
          </label>
          <label className="block text-sm text-slate-200">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Confirm Password</span>
            <input
              className="h-11 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={!ready}
              required
            />
          </label>
          {error ? <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
          <Button className="h-11 w-full" disabled={loading || !ready} type="submit">
            <KeyRound className="h-4 w-4" />
            {loading ? "Saving..." : ready ? "Save New Password" : "Checking Reset Link..."}
          </Button>
          <Link className="block rounded-md px-3 py-2 text-center text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/10 hover:text-white" href="/login">
            Back to login
          </Link>
        </form>
      )}
    </AuthCard>
  );
}
