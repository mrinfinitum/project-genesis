import { Suspense } from "react";
import { Setup2faForm } from "@/components/auth/setup-2fa-form";

export default function Setup2faPage() {
  return (
    <Suspense>
      <Setup2faForm />
    </Suspense>
  );
}

