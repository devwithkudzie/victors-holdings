"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { register, type FormState } from "@/app/(site)/tora-mari/actions";

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, undefined);
  const [method, setMethod] = useState<"ecocash" | "bank">("ecocash");
  const v = (k: string) => state?.values?.[k];
  const err = (f: string) => (state?.field === f ? <p className="tm-error">{state.error}</p> : null);

  return (
    <form action={action} className="tm-form" noValidate>
      <label>
        Full name
        <input name="name" autoComplete="name" defaultValue={v("name")} required />
        {err("name")}
      </label>
      <label>
        WhatsApp number
        <span className="tm-phone">
          <em>+263</em>
          <input name="phone" inputMode="tel" autoComplete="tel-national" placeholder="77 123 4567" defaultValue={v("phone")} required />
        </span>
        {err("phone")}
      </label>
      <label>
        Town or area
        <input name="area" placeholder="e.g. Chitungwiza" defaultValue={v("area")} required />
        {err("area")}
      </label>
      <fieldset>
        <legend>How should we pay you?</legend>
        <div className="tm-seg">
          {(["ecocash", "bank"] as const).map((m) => (
            <label key={m} className={method === m ? "on" : undefined}>
              <input type="radio" name="payoutMethod" value={m} checked={method === m} onChange={() => setMethod(m)} />
              {m === "ecocash" ? "EcoCash" : "Bank transfer"}
            </label>
          ))}
        </div>
        <input
          name="payoutDetails"
          placeholder={method === "ecocash" ? "EcoCash number and registered name" : "Bank, account name and account number"}
          defaultValue={v("payoutDetails")}
          required
        />
        {err("payoutDetails")}
      </fieldset>
      <label>
        Choose a 6-digit PIN
        <input name="pin" type="password" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="new-password" required />
        <small>You&apos;ll log in with your WhatsApp number and this PIN.</small>
        {err("pin")}
      </label>
      <input className="bc-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="tm-check">
        <input type="checkbox" name="agree" />
        <span>
          I agree to the <a href="#rules">Tora Mari rules</a> and to Victors Holdings storing my details to run the programme and pay me
          (see <a href="#privacy">privacy</a>).
        </span>
      </label>
      {err("agree")}
      {state?.error && !state.field && <p className="tm-error">{state.error}</p>}
      <button type="submit" className="tm-btn" disabled={pending}>
        {pending ? "Creating your account…" : "Join Tora Mari →"}
      </button>
      <p className="tm-small">
        Already joined? <Link href="/tora-mari/login">Log in</Link>
      </p>
    </form>
  );
}
