import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ActionForm } from "@/components/tora/ActionForm";
import { AdminNav } from "@/components/tora/AdminNav";
import { getDb } from "@/lib/db";
import { affiliates, clicks, leads, referrals } from "@/lib/db/schema";
import { formatZimMobile } from "@/lib/phone";
import { requireStaff, resetPassword } from "../actions";

export const dynamic = "force-dynamic";

export default async function AffiliatesPage() {
  const me = await requireStaff();
  const db = await getDb();
  const [list, c, l, r] = await Promise.all([
    db.select().from(affiliates).orderBy(desc(affiliates.createdAt)),
    db.select({ id: clicks.affiliateId, n: count() }).from(clicks).groupBy(clicks.affiliateId),
    db.select({ id: leads.affiliateId, n: count() }).from(leads).groupBy(leads.affiliateId),
    db.select({ id: referrals.affiliateId, n: count() }).from(referrals).where(eq(referrals.status, "paid")).groupBy(referrals.affiliateId),
  ]);
  const by = (rows: { id: number; n: number }[]) => new Map(rows.map((x) => [x.id, x.n]));
  const [cm, lm, rm] = [by(c), by(l), by(r)];

  return (
    <>
      <AdminNav name={me.name} role={me.role} />
      <section className="adm-body">
        <h1>Affiliates ({list.length})</h1>
        <div className="adm-table">
          {list.map((a) => (
            <article key={a.id} className="adm-row">
              <div className="adm-row-main">
                <b>
                  {a.code} · {a.name}
                </b>
                <span>
                  {formatZimMobile(a.phone)} · {a.area} · {a.payoutMethod === "ecocash" ? "EcoCash" : "Bank"}: {a.payoutDetails}
                </span>
                <small>
                  {cm.get(a.id) ?? 0} clicks · {lm.get(a.id) ?? 0} quote requests · {rm.get(a.id) ?? 0} paid referrals · joined{" "}
                  {new Date(a.createdAt).toLocaleDateString("en-GB")}
                </small>
              </div>
              <div className="adm-actions">
                <Link href={`/admin/new?code=${a.code}`}>Record order</Link>
              </div>
            </article>
          ))}
        </div>
        {me.role === "admin" && (
          <>
            <h2>Reset an affiliate&apos;s password</h2>
            <ActionForm action={resetPassword} submit="Reset password" className="tm-form adm-form">
              <label>
                Affiliate code
                <input name="code" required />
              </label>
              <label>
                New password (8+ characters)
                <input name="password" type="text" minLength={8} autoComplete="off" required />
              </label>
            </ActionForm>
          </>
        )}
      </section>
    </>
  );
}
