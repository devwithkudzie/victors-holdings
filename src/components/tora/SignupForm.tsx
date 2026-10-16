"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type FormState } from "@/app/(site)/tora-mari/actions";

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, undefined);
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
        <legend>Where should we send your money?</legend>
        <small className="tm-pay-note">We pay by EcoCash.</small>
        <label>
          EcoCash number
          <span className="tm-phone">
            <em>+263</em>
            <input name="ecocashNumber" inputMode="tel" placeholder="77 123 4567" defaultValue={v("ecocashNumber")} required />
          </span>
          <small>Can be the same as your WhatsApp number.</small>
          {err("ecocashNumber")}
        </label>
        <label>
          Name it&apos;s registered in
          <input name="ecocashName" autoComplete="name" placeholder="As it shows when someone sends you money" defaultValue={v("ecocashName")} required />
          {err("ecocashName")}
        </label>
      </fieldset>
      <label>
        Choose a password
        <input name="password" type="password" minLength={8} autoComplete="new-password" required />
        <small>At least 8 characters. You&apos;ll log in with your WhatsApp number and this password.</small>
        {err("password")}
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
