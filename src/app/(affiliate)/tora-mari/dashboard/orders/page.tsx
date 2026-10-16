import { AffiliateShell } from "@/components/tora/AffiliateShell";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { site } from "@/lib/site";
import { REF_STATUS, requireAffiliate, shortDate } from "../data";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "recorded", label: "Ordered" },
  { key: "delivered_paid", label: "Delivered & paid" },
  { key: "approved", label: "Approved" },
  { key: "paid", label: "Paid to you" },
] as const;

/** Every order credited to this affiliate (website or WhatsApp), each with its progress to payout */
export default async function Orders() {
  const { affiliate: a, referrals, payouts, earned, pending } = await requireAffiliate();
  const paidFor = new Map(payouts.map((p) => [p.referralId, p]));
  const open = referrals.filter((r) => r.status !== "rejected" && r.status !== "paid").length;
  const missed = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, Tora Mari: I think an order I referred is missing. My code is ${a.code}. Customer area and date of order: `)}`;

  return (
    <AffiliateShell name={a.name} code={a.code} title="Orders">
      <div className="ad-kpis">
        <div className="ad-card ad-kpi">
          <span>Orders</span>
          <b>{referrals.filter((r) => r.status !== "rejected").length}</b>
          <small>{open} in progress</small>
        </div>
        <div className="ad-card ad-kpi">
          <span>Earned</span>
          <b>US${earned.toLocaleString("en-US")}</b>
          <small>{pending ? `${pending} payout${pending > 1 ? "s" : ""} pending` : `US$${PROGRAMME.reward} per order`}</small>
        </div>
      </div>

      <section className="ad-card">
        <h2>Your orders</h2>
        <p className="ad-muted af-note">
          Includes customers who ordered on WhatsApp without visiting the website, as long as they used your link or mentioned your code{" "}
          <b>{a.code}</b>.
        </p>
        {referrals.length ? (
          <ul className="af-orders">
            {referrals.map((r) => {
              const payout = paidFor.get(r.id);
              const reached = STEPS.findIndex((s) => s.key === r.status);
              return (
                <li key={r.id}>
                  <div className="af-order-top">
                    <div>
                      <b>
                        {r.customerArea} · {r.description}
                      </b>
                      <small>Ordered {shortDate(r.createdAt)}</small>
                    </div>
                    <span className={`af-reward${r.status === "rejected" ? " off" : ""}`}>US${PROGRAMME.reward}</span>
                  </div>
                  {r.status === "rejected" ? (
                    <p className="af-rejected">
                      <span className="ad-pill s-rejected">{REF_STATUS.rejected}</span> {r.note}
                    </p>
                  ) : (
                    <ol className="af-steps" aria-label={REF_STATUS[r.status]}>
                      {STEPS.map((s, i) => (
                        <li key={s.key} className={i <= reached ? "done" : undefined}>
                          {s.label}
                        </li>
                      ))}
                    </ol>
                  )}
                  {payout && (
                    <small className="af-paid">
                      Paid {shortDate(payout.paidAt)} by EcoCash · Ref {payout.reference}
                    </small>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="ad-empty">No orders yet. When someone you referred orders, it appears here — whether they ordered on WhatsApp or on the website.</p>
        )}
      </section>

      <section className="ad-card">
        <h2>Missing an order?</h2>
        <p className="ad-muted">
          If someone you referred ordered but it isn&apos;t here, tell us within {PROGRAMME.disputeDays} days. We check the WhatsApp chat and order log
          and reply within 2 working days.
        </p>
        <a href={missed} target="_blank" rel="noopener noreferrer" className="ad-btn wa">
          Tell us on WhatsApp
        </a>
      </section>

      <section className="ad-card">
        <h2>Paid to</h2>
        <p className="ad-muted">
          EcoCash — {a.payoutDetails}
        </p>
        <small className="ad-muted">To change your payout details, message us on WhatsApp from Account.</small>
      </section>
    </AffiliateShell>
  );
}
