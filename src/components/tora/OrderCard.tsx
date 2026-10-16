import { PROGRAMME } from "@/lib/affiliate-rules";
import type { referrals } from "@/lib/db/schema";
import { formatZimMobile } from "@/lib/phone";
import { recordPayout, setStatus } from "@/app/(admin)/admin/actions";

type Row = { r: typeof referrals.$inferSelect; code: string; name: string; phone: string };

export const STATUS_LABEL: Record<string, string> = {
  recorded: "Waiting for delivery",
  delivered_paid: "Delivered & paid",
  approved: "Approved — pay out",
  paid: "Paid",
  rejected: "Not eligible",
};

const date = (d: Date) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const money = (n: string | number) => `US$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** One referred order with the next action for staff */
export function OrderCard({ row, role }: { row: Row; role: string }) {
  const { r, code, name, phone } = row;
  const first = name.split(" ")[0];
  const wa = `https://wa.me/${phone}?text=${encodeURIComponent(
    r.status === "paid"
      ? `Hi ${first}, your Tora Mari payout of US$${PROGRAMME.reward} for the ${r.customerArea} referral has been sent. Check your dashboard for the reference.`
      : `Hi ${first}, your Tora Mari referral (${r.customerArea}, ${r.description}) was recorded. Track it on your dashboard.`,
  )}`;

  return (
    <article className={`ad-order s-${r.status}`}>
      <div className="ad-order-top">
        <span className={`ad-pill s-${r.status}`}>{STATUS_LABEL[r.status]}</span>
        <time>{date(r.createdAt)}</time>
      </div>
      <div className="ad-order-body">
        <b>{r.description}</b>
        <span>
          {r.customerArea} · {money(r.orderValue)} · customer {formatZimMobile(r.customerPhone)}
        </span>
        <span className="ad-order-aff">
          Referred by <strong>{code}</strong> · {name}
        </span>
        {r.note && <small className="ad-note">⚠ {r.note}</small>}
      </div>
      <div className="ad-order-actions">
        {r.status === "recorded" && (
          <form action={setStatus}>
            <input type="hidden" name="id" value={r.id} />
            <button className="ad-btn primary" name="status" value="delivered_paid">
              Mark delivered &amp; paid
            </button>
          </form>
        )}
        {r.status === "delivered_paid" &&
          (role === "admin" ? (
            <form action={setStatus}>
              <input type="hidden" name="id" value={r.id} />
              <button className="ad-btn primary" name="status" value="approved">
                Approve US${PROGRAMME.reward}
              </button>
            </form>
          ) : (
            <span className="ad-wait">Waiting for an admin to approve</span>
          ))}
        {r.status === "approved" &&
          (role === "admin" ? (
            <form action={recordPayout} className="ad-inline">
              <input type="hidden" name="id" value={r.id} />
              <input name="reference" placeholder="EcoCash reference" required />
              <button className="ad-btn primary">Record payout</button>
            </form>
          ) : (
            <span className="ad-wait">Waiting for an admin to pay</span>
          ))}
        {(r.status === "recorded" || r.status === "delivered_paid") && (
          <details className="ad-reject">
            <summary>Not eligible…</summary>
            <form action={setStatus} className="ad-inline">
              <input type="hidden" name="id" value={r.id} />
              <input name="note" placeholder="Reason (shown to affiliate)" />
              <button className="ad-btn danger" name="status" value="rejected">
                Confirm
              </button>
            </form>
          </details>
        )}
        <a className="ad-btn wa" href={wa} target="_blank" rel="noopener noreferrer">
          WhatsApp {code}
        </a>
      </div>
    </article>
  );
}
