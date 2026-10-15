import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { affiliates, clicks, leads, payouts, referrals } from "../db/schema";

/** Referral cookie: readable by the page so WhatsApp messages can include "Ref: CODE" */
export const REF_COOKIE = "vh_ref";

export const normaliseCode = (c: string) => c.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);

/** TENDAI + 2 digits, unique */
export async function generateCode(name: string) {
  const db = await getDb();
  const base = (name.trim().split(/\s+/)[0] || "VH").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "VH";
  for (let i = 0; i < 20; i++) {
    const code = `${base}${Math.floor(10 + Math.random() * 90)}`;
    const [taken] = await db.select({ id: affiliates.id }).from(affiliates).where(eq(affiliates.code, code));
    if (!taken) return code;
  }
  return `${base}${Date.now().toString().slice(-5)}`;
}

export async function findAffiliateByCode(code: string) {
  const db = await getDb();
  const [a] = await db.select().from(affiliates).where(and(eq(affiliates.code, normaliseCode(code)), eq(affiliates.status, "active")));
  return a ?? null;
}

export async function recordClick(affiliateId: number, landing: string, device: string | null, city: string | null) {
  const db = await getDb();
  await db.insert(clicks).values({ affiliateId, landing, device, city });
}

export async function recordLead(code: string, source: string, summary: string) {
  const a = await findAffiliateByCode(code);
  if (!a) return;
  const db = await getDb();
  await db.insert(leads).values({ affiliateId: a.id, source, summary: summary.slice(0, 300) });
}

/** Everything an affiliate sees on their dashboard */
export async function affiliateDashboard(id: number) {
  const db = await getDb();
  const [a] = await db.select().from(affiliates).where(eq(affiliates.id, id));
  if (!a) return null;
  const [[c], [l], refs, pays, clickRows, leadRows] = await Promise.all([
    db.select({ n: count() }).from(clicks).where(eq(clicks.affiliateId, id)),
    db.select({ n: count() }).from(leads).where(eq(leads.affiliateId, id)),
    db.select().from(referrals).where(eq(referrals.affiliateId, id)).orderBy(desc(referrals.createdAt)),
    db.select().from(payouts).where(eq(payouts.affiliateId, id)).orderBy(desc(payouts.paidAt)),
    // Recent activity for the journey view (no customer personal details are stored here)
    db.select({ at: clicks.at, device: clicks.device, city: clicks.city, landing: clicks.landing }).from(clicks).where(eq(clicks.affiliateId, id)).orderBy(desc(clicks.at)).limit(500),
    db.select({ at: leads.at, source: leads.source, summary: leads.summary }).from(leads).where(eq(leads.affiliateId, id)).orderBy(desc(leads.at)).limit(500),
  ]);
  const earned = pays.reduce((s, p) => s + Number(p.amount), 0);
  const pending = refs.filter((r) => r.status === "delivered_paid" || r.status === "approved").length;
  return { affiliate: a, clicks: c.n, leads: l.n, referrals: refs, payouts: pays, earned, pending, clickRows, leadRows };
}
