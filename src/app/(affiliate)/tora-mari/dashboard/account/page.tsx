import Link from "next/link";
import { AffiliateShell } from "@/components/tora/AffiliateShell";
import { PasswordForm } from "@/components/tora/PasswordForm";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { formatZimMobile } from "@/lib/phone";
import { site } from "@/lib/site";
import { logout } from "@/app/(site)/tora-mari/actions";
import { requireAffiliate, shortDate } from "../data";

export const dynamic = "force-dynamic";

export default async function Account() {
  const { affiliate: a } = await requireAffiliate();
  const wa = (t: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t)}`;
  return (
    <AffiliateShell name={a.name} code={a.code} title="Account">
      <section className="ad-card">
        <div className="ad-aff-head">
          <span className="ad-avatar">{a.name.charAt(0)}</span>
          <div>
            <b>{a.name}</b>
            <small>
              Code {a.code} · joined {shortDate(a.createdAt)}
            </small>
          </div>
        </div>
        <dl className="af-details">
          <div>
            <dt>WhatsApp (login)</dt>
            <dd>{formatZimMobile(a.phone)}</dd>
          </div>
          <div>
            <dt>Area</dt>
            <dd>{a.area}</dd>
          </div>
          <div>
            <dt>Payout</dt>
            <dd>
              {a.payoutMethod === "ecocash" ? "EcoCash" : "Bank"} — {a.payoutDetails}
            </dd>
          </div>
        </dl>
        <a className="ad-btn" href={wa(`Hi, Tora Mari: please update my payout details. My code is ${a.code}.`)} target="_blank" rel="noopener noreferrer">
          Change payout details
        </a>
      </section>

      <section className="ad-card">
        <h2>Change password</h2>
        <PasswordForm />
      </section>

      <section className="ad-card">
        <h2>Help</h2>
        <p className="ad-muted">
          Questions about a referral or payout? {PROGRAMME.contactName} replies on WhatsApp within 1 working day.
        </p>
        <div className="af-actions">
          <a className="ad-btn wa" href={wa(`Hi, Tora Mari question. My code is ${a.code}.`)} target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
          <Link className="ad-btn" href="/tora-mari#rules">
            Programme rules
          </Link>
        </div>
      </section>

      <form action={logout}>
        <button type="submit" className="ad-btn af-logout">
          Log out
        </button>
      </form>
    </AffiliateShell>
  );
}
