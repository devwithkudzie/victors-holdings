import Link from "next/link";
import { AffiliateShell } from "@/components/tora/AffiliateShell";
import { Funnel } from "@/components/tora/Journey";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { site } from "@/lib/site";
import { REF_STATUS, requireAffiliate } from "../data";

export const dynamic = "force-dynamic";

type Event = { at: Date; kind: "click" | "quote" | "order" | "payout"; title: string; detail: string; status?: string };

const TYPES = [
  { key: "all", label: "All" },
  { key: "clicks", label: "Clicks" },
  { key: "quotes", label: "Quotes" },
  { key: "orders", label: "Orders" },
] as const;

const PAGES: Record<string, string> = { "/": "homepage", "/quote": "quote form", "/whatsapp": "WhatsApp chat", "/red-common-bricks": "bricks offer page" };
const where = (landing: string) => PAGES[landing] ?? (landing.startsWith("/products/") ? `${landing.split("/")[2].replace(/-/g, " ")} page` : landing);
const day = (d: Date) => new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const time = (d: Date) => new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default async function Activity({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { affiliate: a, clicks, leads, referrals, payouts, clickRows, leadRows } = await requireAffiliate();
  const { type = "all" } = await searchParams;

  const events: Event[] = [
    ...clickRows.map((c) => ({
      at: c.at,
      kind: "click" as const,
      title: "Someone opened your link",
      detail: [c.device === "mobile" ? "on a phone" : c.device === "desktop" ? "on a computer" : null, c.city ? `near ${c.city}` : null, `landed on the ${where(c.landing)}`].filter(Boolean).join(" · "),
    })),
    ...leadRows.map((l) => ({
      at: l.at,
      kind: "quote" as const,
      title: l.summary.startsWith("Opened a WhatsApp chat") ? "Contacted Victors on WhatsApp" : "Quote request sent",
      detail: l.source === "whatsapp_link" ? "Started a chat straight from your WhatsApp link" : l.summary === "Opened a WhatsApp chat with Victors" ? "Started a chat with Victors from the website" : l.summary || (l.source === "brick_calculator" ? "from the brick calculator" : "from the website"),
    })),
    ...referrals.map((r) => ({ at: r.createdAt, kind: "order" as const, title: "Order recorded", detail: `${r.customerArea} · ${r.description}`, status: r.status })),
    ...payouts.map((p) => ({ at: p.paidAt, kind: "payout" as const, title: `US$${Number(p.amount)} paid to you`, detail: `Ref ${p.reference}` })),
  ]
    .filter((e) => type === "all" || (type === "clicks" && e.kind === "click") || (type === "quotes" && e.kind === "quote") || (type === "orders" && (e.kind === "order" || e.kind === "payout")))
    .sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime())
    .slice(0, 200);

  const groups = new Map<string, Event[]>();
  for (const e of events) {
    const k = day(e.at);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  const ordersCount = referrals.filter((r) => r.status !== "rejected").length;
  const missed = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, Tora Mari: I think a referral was missed. My code is ${a.code}. Customer area: `)}`;

  return (
    <AffiliateShell name={a.name} code={a.code} title="Activity">
      <section className="ad-card">
        <h2>Your journey</h2>
        <Funnel clicks={clicks} quotes={leads} orders={ordersCount} paid={payouts.length} />
      </section>

      <nav className="ad-tabsbar" aria-label="Filter activity">
        {TYPES.map((t) => (
          <Link key={t.key} href={`/tora-mari/dashboard/activity?type=${t.key}`} className={type === t.key ? "on" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>

      {events.length ? (
        <div className="tl">
          {[...groups.entries()].map(([d, list]) => (
            <section key={d} className="tl-day">
              <h3>{d}</h3>
              <ul>
                {list.map((e, i) => (
                  <li key={i} className={`tl-item k-${e.kind}`}>
                    <span className="tl-icon" aria-hidden>
                      {e.kind === "click" ? "👆" : e.kind === "quote" ? "💬" : e.kind === "order" ? "🧱" : "💵"}
                    </span>
                    <div>
                      <b>{e.title}</b>
                      <span>{e.detail}</span>
                      {e.status && <em className={`ad-pill s-${e.status}`}>{REF_STATUS[e.status]}</em>}
                    </div>
                    <time>{time(e.at)}</time>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <section className="ad-card">
          <p className="ad-empty">Nothing here yet. Share your link or a flyer — every click, quote request and order shows up here.</p>
        </section>
      )}

      <section className="ad-card af-help">
        <h2>Missed a referral?</h2>
        <p className="ad-muted">
          Tell us within {PROGRAMME.disputeDays} days. We check the WhatsApp chat and order log and reply within 2 working days.
        </p>
        <a href={missed} target="_blank" rel="noopener noreferrer" className="ad-btn wa">
          Report on WhatsApp
        </a>
      </section>
    </AffiliateShell>
  );
}
