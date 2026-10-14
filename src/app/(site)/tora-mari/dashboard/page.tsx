import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CopyLink } from "@/components/tora/CopyLink";
import { FlyerShare } from "@/components/tora/FlyerShare";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { formatZimMobile } from "@/lib/phone";
import { affiliateDashboard } from "@/lib/server/affiliates";
import { readSession } from "@/lib/server/auth";
import { site } from "@/lib/site";
import { logout } from "../actions";

export const metadata: Metadata = { title: "My Tora Mari dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  recorded: "Recorded — waiting for delivery & payment",
  delivered_paid: "Delivered & paid — payout being approved",
  approved: "Approved — payout on its way",
  paid: "Paid",
  rejected: "Not eligible",
};

const date = (d: Date) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const id = await readSession("affiliate");
  if (!id) redirect("/tora-mari/login");
  const data = await affiliateDashboard(id);
  if (!data) redirect("/tora-mari/login");
  const { affiliate: a, clicks, leads, referrals, payouts, earned, pending } = data;
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const link = `${origin}/r/${a.code}`;
  const welcome = (await searchParams).welcome;

  return (
    <section className="section tm-dash">
      <div className="tm-dash-head">
        <div>
          <p className="tm-kicker">Tora Mari</p>
          <h1 className="section-title">Hi {a.name.split(" ")[0]}</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="tm-btn tm-ghost-dark">
            Log out
          </button>
        </form>
      </div>
      {welcome && <p className="tm-welcome">Welcome! Your code is <b>{a.code}</b>. Share your link below to start earning.</p>}

      <div className="tm-card">
        <b>Your referral link</b>
        <CopyLink
          link={link}
          shareText={`Building? Get quality bricks delivered nationwide from Victors Holdings. Use my link for a quote:`}
        />
        <p className="tm-small">
          Your code: <b>{a.code}</b> — customers can also mention it on WhatsApp.
        </p>
      </div>

      <div className="tm-card">
        <b>Your flyers</b>
        <p className="tm-small">Ready-made flyers with your code and a QR code that opens your link. Prices update automatically.</p>
        <FlyerShare code={a.code} link={link} shareText="Building? Quality bricks delivered nationwide — pay on delivery. Get a quote with my link:" />
      </div>

      <div className="tm-stats">
        <div>
          <b>{clicks}</b>
          <span>Link clicks</span>
        </div>
        <div>
          <b>{leads}</b>
          <span>Quote requests</span>
        </div>
        <div>
          <b>{referrals.length}</b>
          <span>Orders recorded</span>
        </div>
        <div>
          <b>US${earned.toLocaleString("en-US")}</b>
          <span>Paid to you{pending ? ` · ${pending} pending` : ""}</span>
        </div>
      </div>

      <h2 className="tm-h2">Your referrals</h2>
      {referrals.length ? (
        <ul className="tm-list">
          {referrals.map((r) => (
            <li key={r.id}>
              <div>
                <b>
                  {r.customerArea} · {r.description}
                </b>
                <span>{date(r.createdAt)}</span>
              </div>
              <em className={`tm-status ${r.status}`}>{STATUS[r.status]}</em>
              {r.status === "rejected" && r.note && <small>{r.note}</small>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No orders yet. When someone you referred orders, it appears here.</p>
      )}

      <h2 className="tm-h2">Payouts</h2>
      {payouts.length ? (
        <ul className="tm-list">
          {payouts.map((p) => (
            <li key={p.id}>
              <div>
                <b>US${Number(p.amount).toLocaleString("en-US")}</b>
                <span>
                  {date(p.paidAt)} · {p.method}
                </span>
              </div>
              <em className="tm-status paid">Ref: {p.reference}</em>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No payouts yet.</p>
      )}

      <div className="tm-card tm-help">
        <b>Missed a referral or have a question?</b>
        <p>
          Message {PROGRAMME.contactName} on WhatsApp within {PROGRAMME.disputeDays} days and we&apos;ll reply within 2 working days.
        </p>
        <a className="tm-btn tm-wa" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, Tora Mari question. My code is ${a.code}.`)}`}>
          WhatsApp us
        </a>
        <p className="tm-small">
          Payout to: {a.payoutMethod === "ecocash" ? "EcoCash" : "Bank"} — {a.payoutDetails} · Login: {formatZimMobile(a.phone)}
        </p>
      </div>
    </section>
  );
}
