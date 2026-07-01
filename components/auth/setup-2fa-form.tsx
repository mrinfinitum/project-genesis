"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, ShieldPlus } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

function qrCodeSrc(value: string) {
  if (value.startsWith("data:")) {
    return value;
  }

  if (value.trim().startsWith("<svg")) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(value)}`;
  }

  return value;
}

export function Setup2faForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") || "/";

  async function enroll() {
    setError("");
    setLoading(true);

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Project Genesis Studio",
      issuer: "Project Genesis Studio"
    });

    if (enrollError) {
      setError(enrollError.message);
      setLoading(false);
      return;
    }

    setEnrollment({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret
    });
    setLoading(false);
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!enrollment) {
      return;
    }

    setError("");
    setLoading(true);

    const challenge = await supabase.auth.mfa.challenge({
      factorId: enrollment.factorId
    });

    if (challenge.error) {
      setError(challenge.error.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollment.factorId,
      challengeId: challenge.data.id,
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
      eyebrow="Two-Factor Setup"
      title="Secure The Studio"
      description="Add Project Genesis Studio to an authenticator app, then verify the first code to finish sign-in."
    >
      {!enrollment ? (
        <div className="space-y-4">
          <Button className="h-11 w-full" disabled={loading} onClick={enroll} type="button">
            <ShieldPlus className="h-4 w-4" />
            {loading ? "Creating Factor..." : "Create Authenticator Factor"}
          </Button>
          {error ? <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={verify}>
          <div className="rounded-md border border-cyan-300/20 bg-slate-950/50 p-4">
            <div className="mx-auto grid h-48 w-48 place-items-center rounded-md bg-white p-3">
              <img className="h-full w-full" src={qrCodeSrc(enrollment.qrCode)} alt="Authenticator QR code" />
            </div>
            <div className="mt-4 rounded-md border border-slate-700 bg-slate-950/70 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <QrCode className="h-3.5 w-3.5" />
                Manual Secret
              </div>
              <p className="break-all font-mono text-sm text-cyan-100">{enrollment.secret}</p>
            </div>
          </div>
          <label className="block text-sm text-slate-200">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">First Code</span>
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
          <Button className="h-11 w-full" disabled={loading || code.length < 6} type="submit">
            <ShieldPlus className="h-4 w-4" />
            {loading ? "Verifying..." : "Finish 2FA Setup"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

