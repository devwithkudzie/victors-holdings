import Link from "next/link";
import { AffiliateShell } from "@/components/tora/AffiliateShell";
import { CopyLink } from "@/components/tora/CopyLink";
import { DailyClicks, Funnel } from "@/components/tora/Journey";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { REF_STATUS, requireAffiliate, shortDate } from "./data";

export const dynamic = "force-dynamic";

const SHARE = "Building? Quality bricks delivered nationwide — pay on delivery. Get a quote with my link:";
const WA_SHARE = "Building? Quality bricks delivered nationwide — pay on delivery. Chat to Victors Holdings on WhatsApp with my link:";

export default async function AffiliateHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { affiliate: a, clicks, leads, referrals, payouts, earned, pending, link, waLink, clickRows, leadRows } = await requireAffiliate();
  const welcome = (await searchParams).welcome;
  const ordersCount = referrals.filter((r) => r.status !== "rejected").length;
  const stats = [
    { label: "Link clicks", value: clicks },
    { label: "Contacted Victors", value: leads },
    { label: "Orders", value: ordersCount },
    { label: "Earned", value: `US$${earned.toLocaleString("en-US")}`, sub: pending ? `${pending} payout${pending > 1 ? "s" : ""} pending` : undefined },
  ];

  return (
    <AffiliateShell name={a.name} code={a.code} title={`Hi ${a.name.split(" ")[0]}`}>
      {welcome && (
        <div className="ad-alert af-welcome">
          🎉 Welcome to Tora Mari! Your code is <b>{a.code}</b>. Share your link or a flyer to start earning US${PROGRAMME.reward} per referral.
        </div>
      )}

      <section className="ad-card af-link">
        <h2>Your referral links</h2>
        <div className="af-links">
          <div>
            <b>Website link</b>
            <small>Opens a quote form with our prices</small>
            <CopyLink link={link} shareText={SHARE} />
          </div>
          <div>
            <b>WhatsApp link</b>
            <small>Opens a chat with Victors straight away, with your code in the message</small>
            <CopyLink link={waLink} shareText={WA_SHARE} />
          </div>
        </div>
        <Link href="/tora-mari/dashboard/flyers" className="af-flyer-cta">
          <span>🖼️</span>
          <div>
            <b>Share a ready-made flyer</b>
            <small>With your code, a QR code and today&apos;s prices</small>
          </div>
          <em aria-hidden>→</em>
        </Link>
      </section>

      <div className="ad-kpis">
        {stats.map((s) => (
          <div key={s.label} className="ad-card ad-kpi">
            <span>{s.label}</span>
            <b>{s.value}</b>
            {s.sub && <small>{s.sub}</small>}
          </div>
        ))}
      </div>

      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Your journey</h2>
          <Link href="/tora-mari/dashboard/activity">Full activity →</Link>
        </div>
        <Funnel clicks={clicks} quotes={leads} orders={ordersCount} paid={payouts.length} />
      </section>

      <section className="ad-card">
        <h2>Link clicks per day</h2>
        <DailyClicks clicks={clickRows.map((c) => c.at)} quotes={leadRows.map((l) => l.at)} />
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Recent referrals</h2>
          <Link href="/tora-mari/dashboard/orders">See all →</Link>
        </div>
        {referrals.length ? (
          <ul className="af-list">
            {referrals.slice(0, 3).map((r) => (
              <li key={r.id}>
                <div>
                  <b>
                    {r.customerArea} · {r.description}
                  </b>
                  <small>{shortDate(r.createdAt)}</small>
                </div>
                <span className={`ad-pill s-${r.status}`}>{REF_STATUS[r.status].split(" — ")[0]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ad-empty">No orders yet. When someone you referred orders, it appears here.</p>
        )}
      </section>

      <section className="ad-card af-how">
        <h2>How you earn</h2>
        <ol>
          <li>Share your link or flyer with anyone building.</li>
          <li>They chat to Victors on WhatsApp — your code goes with their message. If they message us directly, they just need to mention your code {a.code}.</li>
          <li>
            When their order is delivered and paid, you get <b>US${PROGRAMME.reward}</b> within {PROGRAMME.payoutDays} days.
          </li>
        </ol>
        <Link href="/tora-mari#rules" className="ad-btn">
          Read the rules
        </Link>
      </section>
    </AffiliateShell>
  );
}
