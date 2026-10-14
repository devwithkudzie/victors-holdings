"use client";

import { useActionState } from "react";
import type { AdminState } from "@/app/(admin)/admin/actions";

/** Form wrapper for admin actions: shows the success or error message */
export function ActionForm({
  action,
  submit,
  children,
  className = "tm-form",
}: {
  action: (s: AdminState, f: FormData) => Promise<AdminState>;
  submit: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, run, pending] = useActionState(action, undefined);
  return (
    <form action={run} className={className}>
      {children}
      {state?.error && <p className="tm-error">{state.error}</p>}
      {state?.ok && <p className="tm-ok">{state.ok}</p>}
      <button type="submit" className="tm-btn" disabled={pending}>
        {pending ? "Saving…" : submit}
      </button>
    </form>
  );
}
