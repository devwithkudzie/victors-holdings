"use client";

import { useActionState } from "react";
import { changeAffiliatePassword, type FormState } from "@/app/(site)/tora-mari/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changeAffiliatePassword, undefined);
  return (
    <form action={action} className="ad-form">
      <label>
        Current password
        <input name="current" type="password" autoComplete="current-password" required />
      </label>
      <label>
        New password (8+ characters)
        <input name="next" type="password" minLength={8} autoComplete="new-password" required />
      </label>
      <label>
        Confirm new password
        <input name="confirm" type="password" minLength={8} autoComplete="new-password" required />
      </label>
      {state?.error && <p className="tm-error">{state.error}</p>}
      {state?.ok && <p className="tm-ok">{state.ok}</p>}
      <button type="submit" className="tm-btn" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
