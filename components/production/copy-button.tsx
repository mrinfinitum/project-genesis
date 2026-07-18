"use client";

import { useRef, useState } from "react";
import { Check, Clipboard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "error";

export function ProductionCopyButton({
  label = "Copy",
  copiedLabel = "Copied",
  text,
  getText,
  className
}: {
  label?: string;
  copiedLabel?: string;
  text?: string;
  getText?: () => string;
  className?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const [fallbackText, setFallbackText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    const copyText = getText ? getText() : text ?? "";
    setFallbackText("");
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = copyText;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!ok) throw new Error("Clipboard fallback failed.");
      }
      setState("copied");
      timerRef.current = setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("error");
      setFallbackText(copyText);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={copy}
        className={cn("inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200", className)}
        aria-live="polite"
        aria-label={state === "copied" ? copiedLabel : label}
      >
        {state === "copied" ? <Check className="h-4 w-4" /> : state === "error" ? <AlertTriangle className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
        {state === "copied" ? copiedLabel : state === "error" ? "Copy failed" : label}
      </button>
      {state === "error" ? (
        <label className="w-72 text-xs font-semibold text-amber-100">
          Clipboard blocked. Select and copy manually.
          <textarea value={fallbackText} readOnly className="mt-2 h-24 w-full rounded-md border border-amber-300/25 bg-slate-950/80 p-2 text-xs text-slate-100 outline-none" />
        </label>
      ) : null}
    </div>
  );
}
