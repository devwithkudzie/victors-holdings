import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/tora/AdminShell";
import { OrderCard, STATUS_LABEL } from "@/components/tora/OrderCard";
import { getDb } from "@/lib/db";
import { affiliates, referrals } from "@/lib/db/schema";
import { attentionCount, requireStaff } from "../actions";

export const dynamic = "force-dynamic";

const TABS = ["all", "recorded", "delivered_paid", "approved", "paid", "rejected"] as const;

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const me = await requireStaff();
  const { status = "all", q = "" } = await searchParams;
  const db = await getDb();
  const [all, attention] = await Promise.all([
    db.select({ r: referrals, code: affiliates.code, name: affiliates.name, phone: affiliates.phone }).from(referrals).innerJoin(affiliates, eq(referrals.affiliateId, affiliates.id)).orderBy(desc(referrals.createdAt)),
    attentionCount(me.role),
  ]);
  const term = q.trim().toLowerCase();
  const matches = (x: (typeof all)[number]) =>
    !term || [x.code, x.name, x.r.customerArea, x.r.description, x.r.customerPhone].some((v) => v.toLowerCase().includes(term));
  const rows = all.filter((x) => (status === "all" || x.r.status === status) && matches(x));
  const count = (s: string) => (s === "all" ? all.length : all.filter((x) => x.r.status === s).length);

  return (
    <AdminShell
      name={me.name}
      role={me.role}
      attention={attention}
      title="Orders"
      actions={
        <Link href="/admin/new" className="ad-btn primary">
          + Record order
        </Link>
      }
    >
      <div className="ad-toolbar">
        <nav className="ad-tabsbar" aria-label="Filter by status">
          {TABS.map((t) => (
            <Link key={t} href={`/admin/orders?status=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={status === t ? "on" : undefined}>
              {t === "all" ? "All" : STATUS_LABEL[t]} <em>{count(t)}</em>
            </Link>
          ))}
        </nav>
        <form className="ad-search">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Search code, name, area…" />
        </form>
      </div>
      {rows.length ? (
        <div className="ad-list">
          {rows.map((row) => (
            <OrderCard key={row.r.id} row={row} role={me.role} />
          ))}
        </div>
      ) : (
        <p className="ad-card ad-empty">No orders here yet.</p>
      )}
    </AdminShell>
  );
}
