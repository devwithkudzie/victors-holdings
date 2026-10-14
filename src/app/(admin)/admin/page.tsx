import { desc, eq, gte } from "drizzle-orm";
import { AdminNav } from "@/components/tora/AdminNav";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { getDb } from "@/lib/db";
import { affiliates, clicks, leads, payouts, referrals } from "@/lib/db/schema";
import { recordPayout, requireStaff, setStatus } from "./actions";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const date = (d: Date | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

export default async function AdminHome() {
  const me = await requireStaff();
  const db = await getDb();
  const since = new Date(Date.now() - 30 * DAY);
  const [refs, affs, pays, clickRows, leadRows] = await Promise.all([
    db.select({ r: referrals, code: affiliates.code, name: affiliates.name, phone: affiliates.phone }).from(referrals).innerJoin(affiliates, eq(referrals.affiliateId, affiliates.id)).orderBy(desc(referrals.createdAt)).limit(200),
    db.select({ id: affiliates.id }).from(affiliates),
    db.select({ p: payouts, paidAt: payouts.paidAt, customerPaidAt: referrals.customerPaidAt }).from(payouts).innerJoin(referrals, eq(payouts.referralId, referrals.id)),
    db.select({ id: clicks.id }).from(clicks).where(gte(clicks.at, since)),
    db.select({ affiliateId: leads.affiliateId }).from(leads).where(gte(leads.at, since)),
  ]);

  // Trust & performance measures (from the affiliate plan)
  const days = pays.filter((p) => p.customerPaidAt).map((p) => (new Date(p.paidAt).getTime() - new Date(p.customerPaidAt!).getTime()) / DAY);
  const onTime = days.filter((d) => d <= PROGRAMME.payoutDays).length;
  const activeAffiliates = new Set(leadRows.map((l) => l.affiliateId)).size;
  const paidOut = pays.reduce((s, p) => s + Number(p.p.amount), 0);
  const paidOrders = refs.filter((x) => x.r.status === "paid").length;
  const overdue = refs.filter((x) => (x.r.status === "delivered_paid" || x.r.status === "approved") && x.r.customerPaidAt && Date.now() - new Date(x.r.customerPaidAt).getTime() > (PROGRAMME.payoutDays - 2) * DAY);

  const measures = [
    { label: "On-time payout rate", value: pct(onTime, days.length), hint: `Target 100% within ${PROGRAMME.payoutDays} days` },
    { label: "Average days to payout", value: days.length ? (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : "—", hint: `Target ${PROGRAMME.payoutDays} or fewer` },
    { label: "Active affiliates (30 days)", value: `${activeAffiliates} / ${affs.length}`, hint: "At least 1 quote request in 30 days" },
    { label: "Clicks → quote requests (30 days)", value: `${clickRows.length} → ${leadRows.length}`, hint: "Referral link traffic" },
    { label: "Orders recorded / paid", value: `${refs.length} / ${paidOrders}`, hint: "All time" },
    { label: "Paid to affiliates", value: `US$${paidOut.toLocaleString("en-US")}`, hint: paidOrders ? `US$${(paidOut / paidOrders).toFixed(2)} per referred order` : "Cost per order" },
  ];

  return (
    <>
      <AdminNav name={me.name} role={me.role} />
      <section className="adm-body">
        <h1>Orders & measures</h1>
        {overdue.length > 0 && (
          <p className="tm-error adm-alert">
            ⚠ {overdue.length} payout{overdue.length > 1 ? "s are" : " is"} close to or past the {PROGRAMME.payoutDays}-day promise.
          </p>
        )}
        <div className="adm-measures">
          {measures.map((m) => (
            <div key={m.label}>
              <span>{m.label}</span>
              <b>{m.value}</b>
              <small>{m.hint}</small>
            </div>
          ))}
        </div>

        <h2>Referred orders</h2>
        {!refs.length && <p className="muted">No orders yet — use &ldquo;Record an order&rdquo; when a referred customer buys.</p>}
        <div className="adm-table">
          {refs.map(({ r, code, name, phone }) => (
            <article key={r.id} className={`adm-row ${r.status}`}>
              <div className="adm-row-main">
                <b>
                  {code} · {name}
                </b>
                <span>
                  {r.customerArea} · {r.description} · US${Number(r.orderValue).toLocaleString("en-US")} · customer {r.customerPhone} · {date(r.createdAt)}
                </span>
                {r.note && <small>⚠ {r.note}</small>}
              </div>
              <em className={`tm-status ${r.status}`}>{r.status.replace("_", " & ")}</em>
              <div className="adm-actions">
                {r.status === "recorded" && (
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <button name="status" value="delivered_paid">Mark delivered & paid</button>
                  </form>
                )}
                {r.status === "delivered_paid" && me.role === "admin" && (
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <button name="status" value="approved">Approve US${PROGRAMME.reward}</button>
                  </form>
                )}
                {r.status === "approved" && me.role === "admin" && (
                  <form action={recordPayout} className="adm-inline">
                    <input type="hidden" name="id" value={r.id} />
                    <input name="reference" placeholder="EcoCash / bank reference" required />
                    <button>Record payout</button>
                  </form>
                )}
                {(r.status === "recorded" || r.status === "delivered_paid") && (
                  <form action={setStatus} className="adm-inline">
                    <input type="hidden" name="id" value={r.id} />
                    <input name="note" placeholder="Reason (shown to affiliate)" />
                    <button name="status" value="rejected" className="adm-danger">Not eligible</button>
                  </form>
                )}
                <a
                  className="adm-wa"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://wa.me/${phone}?text=${encodeURIComponent(
                    r.status === "paid"
                      ? `Hi ${name.split(" ")[0]}, your Tora Mari payout of US$${PROGRAMME.reward} for the ${r.customerArea} referral has been sent. Check your dashboard for the reference.`
                      : `Hi ${name.split(" ")[0]}, your Tora Mari referral (${r.customerArea}, ${r.description}) was recorded. Track it on your dashboard.`,
                  )}`}
                >
                  WhatsApp {code}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
