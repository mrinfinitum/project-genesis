"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, ShieldCheck, ShieldPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Factor = {
  id: string;
  friendly_name?: string;
  factor_type?: string;
  status?: string;
};

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

export function AccountSecurityPanel() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [factors, setFactors] = useState<Factor[]>([]);
  const [aal, setAal] = useState("unknown");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const [userResult, factorResult, aalResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    ]);

    setEmail(userResult.data.user?.email ?? "");
    setFactors(factorResult.data?.all ?? []);
    setAal(aalResult.data?.currentLevel ?? "aal1");
  }

  useEffect(() => {
    refresh();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function startEnrollment() {
    setError("");
    setMessage("");
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

  async function verifyEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!enrollment) {
      return;
    }

    setError("");
    setMessage("");
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

    setEnrollment(null);
    setCode("");
    setMessage("Authenticator factor verified.");
    await refresh();
    router.refresh();
    setLoading(false);
  }

  async function removeFactor(factorId: string) {
    setError("");
    setMessage("");
    setLoading(true);

    const { error: removeError } = await supabase.auth.mfa.unenroll({
      factorId
    });

    if (removeError) {
      setError(removeError.message);
      setLoading(false);
      return;
    }

    setMessage("Authenticator factor removed.");
    await refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Account Security</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Settings</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Manage studio sign-in, authenticator factors, and session access.</p>
      </div>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Signed In</p>
            <p className="mt-1 text-lg font-semibold text-white">{email || "Studio account"}</p>
            <p className="mt-1 text-sm text-slate-400">Authenticator assurance: {aal.toUpperCase()}</p>
          </div>
          <Button className="border-red-400/25 bg-red-400/10 text-red-100 hover:border-red-300/60 hover:bg-red-400/20" onClick={signOut} type="button">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Two-Factor Authentication</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Authenticator Factors</h3>
          </div>
          <Button disabled={loading || Boolean(enrollment)} onClick={startEnrollment} type="button">
            <ShieldPlus className="h-4 w-4" />
            Add Authenticator
          </Button>
        </div>

        <div className="overflow-hidden rounded-md border border-cyan-300/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-300/10">
              {factors.length ? (
                factors.map((factor) => (
                  <tr key={factor.id}>
                    <td className="px-4 py-3 text-slate-100">{factor.friendly_name || "Authenticator app"}</td>
                    <td className="px-4 py-3 text-slate-300">{factor.factor_type || "totp"}</td>
                    <td className="px-4 py-3 text-slate-300">{factor.status || "verified"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        className="h-8 border-red-400/25 bg-red-400/10 px-2 text-red-100 hover:border-red-300/60 hover:bg-red-400/20"
                        disabled={loading}
                        onClick={() => removeFactor(factor.id)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-400" colSpan={4}>
                    No authenticator factors enrolled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {enrollment ? (
          <form className="mt-5 grid gap-5 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4 md:grid-cols-[14rem_1fr]" onSubmit={verifyEnrollment}>
            <div className="grid h-56 place-items-center rounded-md bg-white p-3">
              <img className="h-full w-full" src={qrCodeSrc(enrollment.qrCode)} alt="Authenticator QR code" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <KeyRound className="h-3.5 w-3.5" />
                  Manual Secret
                </div>
                <p className="break-all rounded-md border border-slate-700 bg-slate-950/70 p-3 font-mono text-sm text-cyan-100">{enrollment.secret}</p>
              </div>
              <label className="block text-sm text-slate-200">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Verification Code</span>
                <input
                  className="h-11 w-full max-w-xs rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-center text-lg tracking-[0.3em] text-white outline-none transition focus:border-cyan-300/60"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
              </label>
              <Button disabled={loading || code.length < 6} type="submit">
                <ShieldCheck className="h-4 w-4" />
                Verify Factor
              </Button>
            </div>
          </form>
        ) : null}

        {message ? <p className="mt-4 rounded-md border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm text-green-100">{message}</p> : null}
        {error ? <p className="mt-4 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
      </section>
    </div>
  );
}

