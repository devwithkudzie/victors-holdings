import { desc, eq, gte } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/tora/AdminShell";
import { OrderCard } from "@/components/tora/OrderCard";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { getDb } from "@/lib/db";
import { affiliates, auditLog, clicks, leads, payouts, referrals, staff } from "@/lib/db/schema";
import { attentionCount, requireStaff } from "./actions";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");
const ago = (d: Date) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`;
};
const ACTION_TEXT: Record<string, string> = {
  "referral.create": "recorded an order",
  "referral.delivered_paid": "marked an order delivered & paid",
  "referral.approved": "approved a payout",
  "referral.rejected": "marked an order not eligible",
  "payout.create": "recorded a payout",
  "staff.create": "added a staff member",
  "affiliate.password_reset": "reset an affiliate password",
  "staff.password_change": "changed their password",
};

export default async function Overview() {
  const me = await requireStaff();
  const db = await getDb();
  const since = new Date(Date.now() - 30 * DAY);
  const [refs, affs, pays, clickRows, leadRows, activity, attention] = await Promise.all([
    db.select({ r: referrals, code: affiliates.code, name: affiliates.name, phone: affiliates.phone }).from(referrals).innerJoin(affiliates, eq(referrals.affiliateId, affiliates.id)).orderBy(desc(referrals.createdAt)),
    db.select({ id: affiliates.id, createdAt: affiliates.createdAt }).from(affiliates),
    db.select({ amount: payouts.amount, paidAt: payouts.paidAt, customerPaidAt: referrals.customerPaidAt }).from(payouts).innerJoin(referrals, eq(payouts.referralId, referrals.id)),
    db.select({ id: clicks.id }).from(clicks).where(gte(clicks.at, since)),
    db.select({ affiliateId: leads.affiliateId }).from(leads).where(gte(leads.at, since)),
    db.select({ a: auditLog, name: staff.name }).from(auditLog).leftJoin(staff, eq(auditLog.staffId, staff.id)).orderBy(desc(auditLog.at)).limit(8),
    attentionCount(me.role),
  ]);

  const days = pays.filter((p) => p.customerPaidAt).map((p) => (new Date(p.paidAt).getTime() - new Date(p.customerPaidAt!).getTime()) / DAY);
  const onTime = days.filter((d) => d <= PROGRAMME.payoutDays).length;
  const paidOut = pays.reduce((s, p) => s + Number(p.amount), 0);
  const newAffs = affs.filter((a) => new Date(a.createdAt) >= since).length;
  const activeAffs = new Set(leadRows.map((l) => l.affiliateId)).size;
  const overdue = refs.filter((x) => (x.r.status === "delivered_paid" || x.r.status === "approved") && x.r.customerPaidAt && Date.now() - new Date(x.r.customerPaidAt).getTime() > (PROGRAMME.payoutDays - 2) * DAY);
  const queue = refs.filter((x) => x.r.status === "recorded" || (me.role === "admin" && (x.r.status === "delivered_paid" || x.r.status === "approved"))).slice(0, 5);
  const count = (s: string) => refs.filter((x) => x.r.status === s).length;

  const kpis = [
    { label: "Affiliates", value: affs.length, sub: `${newAffs} joined in 30 days` },
    { label: "Link clicks", value: clickRows.length, sub: `${leadRows.length} quote requests · 30 days` },
    { label: "Orders", value: refs.length, sub: `${count("paid")} paid out` },
    { label: "Paid to affiliates", value: `US$${paidOut.toLocaleString("en-US")}`, sub: `${pct(onTime, days.length)} on time` },
  ];
  const pipeline = ["recorded", "delivered_paid", "approved", "paid"].map((s) => ({ s, n: count(s) }));

  return (
    <AdminShell
      name={me.name}
      role={me.role}
      attention={attention}
      title="Overview"
      actions={
        <Link href="/admin/new" className="ad-btn primary">
          + Record order
        </Link>
      }
    >
      {overdue.length > 0 && (
        <div className="ad-alert">
          ⚠ {overdue.length} payout{overdue.length > 1 ? "s are" : " is"} close to or past the {PROGRAMME.payoutDays}-day promise.{" "}
          <Link href="/admin/orders?status=approved">Review</Link>
        </div>
      )}

      <div className="ad-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="ad-card ad-kpi">
            <span>{k.label}</span>
            <b>{k.value}</b>
            <small>{k.sub}</small>
          </div>
        ))}
      </div>

      <div className="ad-grid">
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Needs your attention</h2>
            <Link href="/admin/orders">All orders →</Link>
          </div>
          {queue.length ? (
            <div className="ad-list">
              {queue.map((row) => (
                <OrderCard key={row.r.id} row={row} role={me.role} />
              ))}
            </div>
          ) : (
            <p className="ad-empty">Nothing waiting — you&apos;re all caught up.</p>
          )}
        </section>

        <div className="ad-stack">
          <section className="ad-card">
            <h2>Order pipeline</h2>
            <ul className="ad-pipe">
              {pipeline.map((p) => (
                <li key={p.s}>
                  <Link href={`/admin/orders?status=${p.s}`}>
                    <span className={`ad-dot s-${p.s}`} />
                    {
                      { recorded: "Waiting for delivery", delivered_paid: "Delivered & paid", approved: "Approved", paid: "Paid" }[
                        p.s as "recorded"
                      ]
                    }
                    <b>{p.n}</b>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="ad-muted">
              Active affiliates (30 days): <b>{activeAffs}</b>
            </p>
          </section>

          <section className="ad-card">
            <h2>Recent activity</h2>
            {activity.length ? (
              <ul className="ad-activity">
                {activity.map(({ a, name }) => (
                  <li key={a.id}>
                    <b>{name ?? "System"}</b> {ACTION_TEXT[a.action] ?? a.action}
                    <time>{ago(a.at)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ad-empty">No activity yet.</p>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
