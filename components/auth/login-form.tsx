"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, ShieldCheck } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") || "/";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
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
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Password</span>
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
        <Button className="h-11 w-full" disabled={loading} type="submit">
          {requireMfa() ? <ShieldCheck className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          {loading ? "Authenticating..." : "Sign In"}
        </Button>
      </form>
    </AuthCard>
  );
}

