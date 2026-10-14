"use server";

import { and, count, eq, ne, or } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { getDb } from "@/lib/db";
import { affiliates, auditLog, payouts, referrals, staff } from "@/lib/db/schema";
import { normaliseZimMobile } from "@/lib/phone";
import { normaliseCode } from "@/lib/server/affiliates";
import { checkSecret, endSession, hashSecret, readSession, startSession } from "@/lib/server/auth";
import { checkVisitor } from "@/lib/server/protection";

export type AdminState = { error?: string; ok?: string } | undefined;
const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);

/** The signed-in staff member, or a redirect to the login page */
export async function requireStaff(role?: "admin") {
  const id = await readSession("staff");
  if (!id) redirect("/admin/login");
  const db = await getDb();
  const [s] = await db.select().from(staff).where(and(eq(staff.id, id), eq(staff.active, 1)));
  if (!s) redirect("/admin/login");
  if (role && s.role !== role) redirect("/admin");
  return s;
}

async function audit(staffId: number, action: string, detail: unknown) {
  const db = await getDb();
  await db.insert(auditLog).values({ staffId, action, detail });
}

export async function staffLogin(_: AdminState, f: FormData): Promise<AdminState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = await checkVisitor("login", ip);
  if (!limit.ok) return { error: limit.message };
  const email = str(f, "email").toLowerCase();
  const password = str(f, "password");
  const db = await getDb();

  // First run: create the owner account from ADMIN_EMAIL / ADMIN_PASSWORD (only while no staff exist)
  const [{ n }] = await db.select({ n: count() }).from(staff);
  if (n === 0) {
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && email === process.env.ADMIN_EMAIL.toLowerCase() && password === process.env.ADMIN_PASSWORD) {
      const [s] = await db.insert(staff).values({ email, name: "Owner", passwordHash: await hashSecret(password), role: "admin" }).returning();
      await startSession("staff", s.id);
      redirect("/admin");
    }
    return { error: "No staff accounts yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel and log in with them." };
  }

  const [s] = await db.select().from(staff).where(eq(staff.email, email));
  if (!s || !s.active || !(await checkSecret(password, s.passwordHash))) return { error: "Wrong email or password." };
  await startSession("staff", s.id);
  redirect("/admin");
}

export async function staffLogout() {
  await endSession("staff");
  redirect("/admin/login");
}

/** Sales: attach an order to an affiliate */
export async function recordOrder(_: AdminState, f: FormData): Promise<AdminState> {
  const me = await requireStaff();
  const db = await getDb();
  const who = str(f, "affiliate");
  const asPhone = normaliseZimMobile(who);
  const [a] = await db
    .select()
    .from(affiliates)
    .where(or(eq(affiliates.code, normaliseCode(who)), ...(asPhone ? [eq(affiliates.phone, asPhone)] : [])));
  if (!a) return { error: `No affiliate found with code or number "${who}".` };

  const customerPhone = normaliseZimMobile(str(f, "customerPhone"));
  if (!customerPhone) return { error: "Enter the customer's WhatsApp number." };
  if (customerPhone === a.phone) return { error: "Affiliates can't earn on their own orders (rules)." };
  const customerArea = str(f, "customerArea", 80);
  const description = str(f, "description", 120);
  const orderValue = Number(str(f, "orderValue"));
  if (!customerArea || !description || !(orderValue > 0)) return { error: "Fill in the area, order and value." };

  // First order only: has this customer been referred before?
  const [prior] = await db.select({ id: referrals.id }).from(referrals).where(and(eq(referrals.customerPhone, customerPhone), ne(referrals.status, "rejected")));
  const note = prior ? "Customer already has a referred order — check it's their first order before approving." : orderValue < PROGRAMME.minOrderValue ? `Below the US$${PROGRAMME.minOrderValue} minimum unless it's ${PROGRAMME.minOrderBricks.toLocaleString("en-US")}+ bricks.` : null;

  const [r] = await db
    .insert(referrals)
    .values({ affiliateId: a.id, customerPhone, customerArea, description, orderValue: orderValue.toFixed(2), note, createdBy: me.id })
    .returning();
  await audit(me.id, "referral.create", { referral: r.id, affiliate: a.code, orderValue });
  revalidatePath("/admin");
  return { ok: `Order recorded for ${a.code} (${a.name}).${note ? " ⚠ " + note : ""}` };
}

/** Move a referral along: delivered & paid → approved → rejected */
export async function setStatus(f: FormData) {
  const me = await requireStaff();
  const id = Number(f.get("id"));
  const status = String(f.get("status")) as "delivered_paid" | "approved" | "rejected";
  if (!["delivered_paid", "approved", "rejected"].includes(status)) return;
  if (status === "approved" && me.role !== "admin") return;
  const db = await getDb();
  await db
    .update(referrals)
    .set({ status, updatedAt: new Date(), ...(status === "delivered_paid" ? { customerPaidAt: new Date() } : {}), ...(status === "rejected" ? { note: str(f, "note", 200) || "Not eligible under the rules" } : {}) })
    .where(eq(referrals.id, id));
  await audit(me.id, `referral.${status}`, { referral: id });
  revalidatePath("/admin");
}

/** Admin: record the US$20 payment with its EcoCash/bank reference */
export async function recordPayout(f: FormData) {
  const me = await requireStaff("admin");
  const id = Number(f.get("id"));
  const reference = str(f, "reference", 80);
  if (!reference) return;
  const db = await getDb();
  const [r] = await db.select().from(referrals).where(eq(referrals.id, id));
  if (!r || r.status !== "approved") return;
  const [a] = await db.select().from(affiliates).where(eq(affiliates.id, r.affiliateId));
  await db.insert(payouts).values({ referralId: r.id, affiliateId: r.affiliateId, amount: String(PROGRAMME.reward), method: a.payoutMethod, reference, paidBy: me.id });
  await db.update(referrals).set({ status: "paid", updatedAt: new Date() }).where(eq(referrals.id, id));
  await audit(me.id, "payout.create", { referral: id, reference });
  revalidatePath("/admin");
}

export async function addStaff(_: AdminState, f: FormData): Promise<AdminState> {
  const me = await requireStaff("admin");
  const email = str(f, "email").toLowerCase();
  const name = str(f, "name", 80);
  const password = str(f, "password", 100);
  const role = str(f, "role") === "admin" ? "admin" : "sales";
  if (!/^\S+@\S+\.\S+$/.test(email) || name.length < 2) return { error: "Enter a name and a valid email." };
  if (password.length < 10) return { error: "Use a password of at least 10 characters." };
  const db = await getDb();
  const [exists] = await db.select({ id: staff.id }).from(staff).where(eq(staff.email, email));
  if (exists) return { error: "That email already has an account." };
  await db.insert(staff).values({ email, name, role, passwordHash: await hashSecret(password) });
  await audit(me.id, "staff.create", { email, role });
  revalidatePath("/admin/staff");
  return { ok: `${name} can now log in as ${role}.` };
}

/** Admin: reset an affiliate's PIN (they ask on WhatsApp) */
export async function resetPin(_: AdminState, f: FormData): Promise<AdminState> {
  const me = await requireStaff("admin");
  const code = normaliseCode(str(f, "code"));
  const pin = str(f, "pin", 6);
  if (!/^\d{6}$/.test(pin)) return { error: "New PIN must be 6 digits." };
  const db = await getDb();
  const res = await db.update(affiliates).set({ pinHash: await hashSecret(pin) }).where(eq(affiliates.code, code)).returning({ id: affiliates.id });
  if (!res.length) return { error: `No affiliate with code ${code}.` };
  await audit(me.id, "affiliate.pin_reset", { code });
  return { ok: `PIN reset for ${code}. Send it to them on WhatsApp.` };
}
