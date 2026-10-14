import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/tora/SignupForm";
import { PROGRAMME, RULES, RULES_VERSION } from "@/lib/affiliate-rules";
import { programmeTotals } from "@/lib/server/affiliates";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tora Mari — earn US$20 for every customer you refer",
  description: "Join Tora Mari, the Victors Holdings referral programme. Share your link, and earn US$20 when your referral's brick order is delivered and paid.",
  alternates: { canonical: "/tora-mari" },
};

export const dynamic = "force-dynamic";

const STEPS = [
  { title: "Join free", text: "Sign up in a minute and get your own code and link, e.g. victorsholdings.co.zw/r/TENDAI20." },
  { title: "Share your link", text: "Send it to anyone building — on WhatsApp, Facebook or in person. Your code goes into their WhatsApp chat with us." },
  { title: "Get paid US$20", text: `When their order is delivered and paid, we pay you by EcoCash or bank within ${PROGRAMME.payoutDays} days.` },
];

const TRUST = [
  { title: "See every referral", text: "Your dashboard shows clicks, quote requests, orders and payouts as we record them." },
  { title: "Proof of every payment", text: "Each payout comes with its EcoCash or bank reference, shown on your dashboard." },
  { title: "Fair if we miss one", text: `Tell us within ${PROGRAMME.disputeDays} days and we check the chat and order log within 2 working days.` },
  { title: "Rules in writing", text: "One short set of rules with a version date, and 30 days' notice of any change." },
];

export default async function ToraMariPage() {
  const totals = await programmeTotals().catch(() => ({ totalPaid: 0, affiliatesPaid: 0 }));
  return (
    <>
      <section className="tm-hero">
        <div className="tm-hero-inner">
          <p className="tm-kicker">Victors Holdings referral programme</p>
          <h1>
            Tora Mari! <span>Earn US${PROGRAMME.reward} for every customer you refer.</span>
          </h1>
          <p>Know someone building? Share your link. When their brick order is delivered and paid, you get US${PROGRAMME.reward}.</p>
          <div className="tm-hero-actions">
            <a href="#join" className="tm-btn">
              Join free →
            </a>
            <Link href="/tora-mari/login" className="tm-btn tm-ghost">
              Log in
            </Link>
          </div>
          {totals.totalPaid > 0 && (
            <p className="tm-proof">
              US${totals.totalPaid.toLocaleString("en-US")} paid to {totals.affiliatesPaid} affiliate{totals.affiliatesPaid === 1 ? "" : "s"} so far
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">How it works</h2>
        <ol className="tm-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span>{i + 1}</span>
              <b>{s.title}</b>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section tm-trust">
        <h2 className="section-title">Why you can trust it</h2>
        <div className="tm-grid">
          {TRUST.map((t) => (
            <div key={t.title}>
              <b>{t.title}</b>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section tm-join" id="join">
        <div className="tm-join-grid">
          <div>
            <h2 className="section-title">Join Tora Mari</h2>
            <p className="muted">Free to join. You&apos;ll get your code and link straight away.</p>
          </div>
          <div className="tm-card">
            <SignupForm />
          </div>
        </div>
      </section>

      <section className="section" id="rules">
        <h2 className="section-title">The rules</h2>
        <p className="tm-version">Version: {RULES_VERSION}</p>
        <dl className="tm-rules">
          {RULES.map((r) => (
            <div key={r.title}>
              <dt>{r.title}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section section-tight" id="privacy">
        <h2 className="section-title">Privacy</h2>
        <p className="tm-privacy">
          We store your name, WhatsApp number, area and payout details only to run Tora Mari: to count your referrals, show your dashboard and pay
          you. We don&apos;t sell or share them. Customers you refer are shown on your dashboard by area and order size only. To see, correct or
          delete your details, message us on WhatsApp (+{site.whatsapp}). Your PIN is stored encrypted; we can&apos;t see it.
        </p>
      </section>
    </>
  );
}
