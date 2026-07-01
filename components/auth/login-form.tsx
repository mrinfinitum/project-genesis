"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, LogIn, ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function requireMfa() {
  return process.env.NEXT_PUBLIC_REQUIRE_MFA === "true";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const next = searchParams.get("next") || "/";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (requireMfa()) {
      const { data, error: factorError } = await supabase.auth.mfa.listFactors();

      if (factorError) {
        setError(factorError.message);
        setLoading(false);
        return;
      }

      const verifiedTotp = data.totp.find((factor) => factor.status === "verified");
      router.push(`${verifiedTotp ? "/auth/mfa" : "/auth/setup-2fa"}?next=${encodeURIComponent(next)}`);
      router.refresh();
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleResetPassword() {
    setError("");
    setMessage("");

    if (!email) {
      setError("Enter your email address first, then use the password reset link.");
      return;
    }

    setResetLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`
    });

    if (resetError) {
      setError(resetError.message);
      setResetLoading(false);
      return;
    }

    setMessage("Password reset email sent. Open the link in that email to choose a new password.");
    setResetLoading(false);
  }

  return (
    <AuthCard
      eyebrow="Secure Access"
      title="Project Genesis Studio"
      description="Sign in with your studio account to manage research, buildings, assets, and release data."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-200">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</span>
          <input
            className="h-11 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-slate-200">
          <span className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Password</span>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={resetLoading}
              onClick={handleResetPassword}
              type="button"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Reset
            </button>
          </span>
          <input
            className="h-11 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
        {message ? <p className="rounded-md border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm text-green-100">{message}</p> : null}
        <Button className="h-11 w-full" disabled={loading} type="submit">
          {requireMfa() ? <ShieldCheck className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          {loading ? "Authenticating..." : "Sign In"}
        </Button>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={resetLoading}
          onClick={handleResetPassword}
          type="button"
        >
          <KeyRound className="h-4 w-4" />
          {resetLoading ? "Sending reset email..." : "Forgot password?"}
        </button>
      </form>
    </AuthCard>
  );
}
