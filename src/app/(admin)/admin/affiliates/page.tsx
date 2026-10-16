import { count, desc, gte, ne, sql } from "drizzle-orm";
import Link from "next/link";
import { ActionForm } from "@/components/tora/ActionForm";
import { AdminShell } from "@/components/tora/AdminShell";
import { getDb } from "@/lib/db";
import { affiliates, clicks, leads, payouts, referrals } from "@/lib/db/schema";
import { formatZimMobile } from "@/lib/phone";
import { attentionCount, requireStaff, resetPassword } from "../actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const DAY = 86_400_000;

const COLUMNS = [
  { key: "name", label: "Affiliate" },
  { key: "area", label: "Area" },
  { key: "joined", label: "Joined" },
  { key: "clicks", label: "Clicks", num: true },
  { key: "quotes", label: "Quotes", num: true },
  { key: "orders", label: "Orders", num: true },
  { key: "earned", label: "Paid out", num: true },
] as const;
type SortKey = (typeof COLUMNS)[number]["key"];

const date = (d: Date) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
const usd = (n: number) => `US$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

type Params = { q?: string; sort?: string; dir?: string; page?: string };

export default async function AffiliatesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const me = await requireStaff();
  const { q = "", sort = "joined", dir = "desc", page = "1" } = await searchParams;
  const db = await getDb();
  const since = new Date(Date.now() - 30 * DAY);

  const [list, c, l, o, p, recentLeads, attention] = await Promise.all([
    db.select().from(affiliates).orderBy(desc(affiliates.createdAt)),
    db.select({ id: clicks.affiliateId, n: count() }).from(clicks).groupBy(clicks.affiliateId),
    db.select({ id: leads.affiliateId, n: count() }).from(leads).groupBy(leads.affiliateId),
    db.select({ id: referrals.affiliateId, n: count() }).from(referrals).where(ne(referrals.status, "rejected")).groupBy(referrals.affiliateId),
    db.select({ id: payouts.affiliateId, n: sql<string>`sum(${payouts.amount})` }).from(payouts).groupBy(payouts.affiliateId),
    db.select({ id: leads.affiliateId }).from(leads).where(gte(leads.at, since)),
    attentionCount(me.role),
  ]);
  const by = (rows: { id: number; n: number | string }[]) => new Map(rows.map((x) => [x.id, Number(x.n)]));
  const [cm, lm, om, pm] = [by(c), by(l), by(o), by(p)];
  const active = new Set(recentLeads.map((x) => x.id));

  const rows = list.map((a) => ({
    a,
    clicks: cm.get(a.id) ?? 0,
    quotes: lm.get(a.id) ?? 0,
    orders: om.get(a.id) ?? 0,
    earned: pm.get(a.id) ?? 0,
    active: active.has(a.id),
  }));

  // Stats
  const totalPaid = rows.reduce((s, r) => s + r.earned, 0);
  const earning = rows.filter((r) => r.earned > 0).length;
  const top = [...rows].sort((x, y) => y.orders - x.orders || y.clicks - x.clicks)[0];
  const stats = [
    { label: "Affiliates", value: rows.length, sub: `${rows.filter((r) => new Date(r.a.createdAt) >= since).length} joined in 30 days` },
    { label: "Active (30 days)", value: active.size, sub: `${rows.length ? Math.round((active.size / rows.length) * 100) : 0}% sent a quote request` },
    { label: "Earning", value: earning, sub: "have been paid at least once" },
    { label: "Paid out", value: usd(totalPaid), sub: earning ? `${usd(totalPaid / earning)} per earning affiliate` : "nothing paid yet" },
    { label: "Top affiliate", value: top && top.orders ? top.a.code : "—", sub: top && top.orders ? `${top.a.name} · ${top.orders} order${top.orders > 1 ? "s" : ""}` : "no orders yet" },
  ];

  // Search, sort, page
  const term = q.trim().toLowerCase();
  const filtered = rows.filter((r) => !term || [r.a.code, r.a.name, r.a.phone, r.a.area].some((v) => v.toLowerCase().includes(term)));
  const sortKey: SortKey = COLUMNS.some((col) => col.key === sort) ? (sort as SortKey) : "joined";
  const asc = dir === "asc" ? 1 : -1;
  const value = (r: (typeof rows)[number]) =>
    sortKey === "name" ? r.a.name.toLowerCase() : sortKey === "area" ? r.a.area.toLowerCase() : sortKey === "joined" ? new Date(r.a.createdAt).getTime() : r[sortKey];
  filtered.sort((x, y) => (value(x) > value(y) ? asc : value(x) < value(y) ? -asc : 0));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const href = (over: Partial<Params>) => {
    const sp = new URLSearchParams({ ...(q && { q }), sort: sortKey, dir, page: String(current), ...over } as Record<string, string>);
    return `/admin/affiliates?${sp}`;
  };

  return (
    <AdminShell name={me.name} role={me.role} attention={attention} title="Affiliates">
      <div className="ad-kpis ad-kpis-5">
        {stats.map((s) => (
          <div key={s.label} className="ad-card ad-kpi">
            <span>{s.label}</span>
            <b>{s.value}</b>
            <small>{s.sub}</small>
          </div>
        ))}
      </div>

      <section className="ad-card ad-table-card">
        <div className="ad-table-head">
          <h2>
            All affiliates <span className="ad-muted">({filtered.length})</span>
          </h2>
          <form className="ad-search">
            <input type="hidden" name="sort" value={sortKey} />
            <input type="hidden" name="dir" value={dir} />
            <input name="q" defaultValue={q} placeholder="Search code, name, number, area…" />
          </form>
        </div>

        {shown.length ? (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => {
                    const on = sortKey === col.key;
                    const nextDir = on && dir === "desc" ? "asc" : "desc";
                    return (
                      <th key={col.key} className={"num" in col ? "num" : undefined} aria-sort={on ? (dir === "asc" ? "ascending" : "descending") : undefined}>
                        <Link href={href({ sort: col.key, dir: nextDir, page: "1" })} className={on ? "on" : undefined}>
                          {col.label}
                          <span aria-hidden>{on ? (dir === "asc" ? " ↑" : " ↓") : ""}</span>
                        </Link>
                      </th>
                    );
                  })}
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.a.id}>
                    <td className="ad-td-aff">
                      <span className={`ad-dot${r.active ? " s-paid" : ""}`} title={r.active ? "Active in the last 30 days" : "No quote requests in 30 days"} />
                      <div>
                        <b>{r.a.name}</b>
                        <small>
                          {r.a.code} · {formatZimMobile(r.a.phone)}
                        </small>
                      </div>
                    </td>
                    <td className="ad-td-area" title={r.a.area}>
                      {r.a.area}
                    </td>
                    <td className="ad-td-date">{date(r.a.createdAt)}</td>
                    <td className="num">{r.clicks}</td>
                    <td className="num">{r.quotes}</td>
                    <td className="num">{r.orders}</td>
                    <td className="num">
                      <b>{usd(r.earned)}</b>
                    </td>
                    <td className="ad-td-actions">
                      <Link href={`/admin/new?code=${r.a.code}`} className="ad-btn">
                        + Order
                      </Link>
                      <a href={`https://wa.me/${r.a.phone}`} target="_blank" rel="noopener noreferrer" className="ad-btn wa" title={`EcoCash: ${r.a.payoutDetails}`}>
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ad-empty">{term ? "No affiliates match your search." : "No affiliates yet."}</p>
        )}

        {pages > 1 && (
          <nav className="ad-pager" aria-label="Pages">
            {current > 1 && <Link href={href({ page: String(current - 1) })}>← Previous</Link>}
            <span>
              Page {current} of {pages}
            </span>
            {current < pages && <Link href={href({ page: String(current + 1) })}>Next →</Link>}
          </nav>
        )}
      </section>

      {me.role === "admin" && (
        <section className="ad-card ad-narrow">
          <h2>Reset an affiliate&apos;s password</h2>
          <ActionForm action={resetPassword} submit="Reset password" className="ad-form">
            <div className="ad-two">
              <label>
                Affiliate code
                <input name="code" required />
              </label>
              <label>
                New password (8+ characters)
                <input name="password" type="text" minLength={8} autoComplete="off" required />
              </label>
            </div>
          </ActionForm>
        </section>
      )}
    </AdminShell>
  );
}
