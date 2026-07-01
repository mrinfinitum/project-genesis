"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function MfaChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    let mounted = true;

    async function loadFactor() {
      const { data, error: factorError } = await supabase.auth.mfa.listFactors();

      if (!mounted) {
        return;
      }

      if (factorError) {
        setError(factorError.message);
        return;
      }

      const verifiedTotp = data.totp[0];

      if (!verifiedTotp) {
        router.replace(`/auth/setup-2fa?next=${encodeURIComponent(next)}`);
        return;
      }

      setFactorId(verifiedTotp.id);
    }

    loadFactor();

    return () => {
      mounted = false;
    };
  }, [next, router, supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <AuthCard
      eyebrow="Two-Factor"
      title="Verify Access"
      description="Enter the current 6-digit code from your authenticator app to open the studio."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-200">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Authenticator Code</span>
          <input
            className="h-11 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-center text-lg tracking-[0.3em] text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />
        </label>
        {error ? <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
        <Button className="h-11 w-full" disabled={loading || !factorId || code.length < 6} type="submit">
          <ShieldCheck className="h-4 w-4" />
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </AuthCard>
  );
}

