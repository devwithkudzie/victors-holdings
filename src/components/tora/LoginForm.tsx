"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type FormState } from "@/app/(site)/tora-mari/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);
  return (
    <form action={action} className="tm-form">
      <label>
        WhatsApp number
        <span className="tm-phone">
          <em>+263</em>
          <input name="phone" inputMode="tel" autoComplete="tel-national" placeholder="77 123 4567" defaultValue={state?.values?.phone} required />
        </span>
      </label>
      <label>
        PIN
        <input name="pin" type="password" inputMode="numeric" maxLength={6} autoComplete="current-password" required />
      </label>
      {state?.error && <p className="tm-error">{state.error}</p>}
      <button type="submit" className="tm-btn" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="tm-small">
        New here? <Link href="/tora-mari#join">Join Tora Mari</Link>
      </p>
    </form>
  );
}
