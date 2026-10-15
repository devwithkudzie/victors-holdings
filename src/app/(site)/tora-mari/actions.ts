"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { RULES_VERSION } from "@/lib/affiliate-rules";
import { getDb } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { normaliseZimMobile } from "@/lib/phone";
import { generateCode } from "@/lib/server/affiliates";
import { checkSecret, endSession, hashSecret, startSession } from "@/lib/server/auth";
import { checkVisitor } from "@/lib/server/protection";

/** values: what the person typed (never the password), so the form can be refilled after an error */
export type FormState = { error?: string; ok?: string; field?: string; values?: Record<string, string> } | undefined;

const ip = async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
const str = (f: FormData, k: string, max = 120) => String(f.get(k) ?? "").trim().slice(0, max);

const SERVER_ERROR = { error: "Something went wrong on our side. Please try again in a few minutes, or message us on WhatsApp." };

/** Never let a server problem crash the page: log it and show a friendly message */
async function safely(run: () => Promise<FormState>): Promise<FormState> {
  try {
    return await run();
  } catch (e) {
    if (isRedirectError(e)) throw e; // successful sign-up/login redirects
    console.error("[tora-mari] action failed", e);
    return SERVER_ERROR;
  }
}

export async function register(_prev: FormState, f: FormData): Promise<FormState> {
  const r = await safely(() => registerInner(f));
  if (!r) return r;
  return { ...r, values: { name: str(f, "name"), phone: str(f, "phone"), area: str(f, "area"), payoutMethod: str(f, "payoutMethod"), payoutDetails: str(f, "payoutDetails", 200) } };
}

async function registerInner(f: FormData): Promise<FormState> {
  if (str(f, "website")) return { error: "Please try again." }; // trap field for bots
  const limit = await checkVisitor("signup", await ip());
  if (!limit.ok) return { error: limit.message };

  const name = str(f, "name", 80);
  const phone = normaliseZimMobile(str(f, "phone"));
  const area = str(f, "area", 80);
  const payoutMethod = str(f, "payoutMethod") === "bank" ? "bank" : "ecocash";
  const payoutDetails = str(f, "payoutDetails", 200);
  const password = String(f.get("password") ?? "").slice(0, 100);

  if (name.length < 2) return { field: "name", error: "Enter your full name." };
  if (!phone) return { field: "phone", error: "Enter a valid Zimbabwean WhatsApp number, e.g. 077 123 4567." };
  if (area.length < 2) return { field: "area", error: "Enter your town or area." };
  if (payoutDetails.length < 4) {
    return { field: "payoutDetails", error: payoutMethod === "ecocash" ? "Enter the EcoCash number and name it's registered in." : "Enter your bank, account name and account number." };
  }
  if (password.length < 8) return { field: "password", error: "Choose a password of at least 8 characters." };
  if (f.get("agree") !== "on") return { field: "agree", error: "Please agree to the rules and privacy notice." };

  const db = await getDb();
  const [existing] = await db.select({ id: affiliates.id }).from(affiliates).where(eq(affiliates.phone, phone));
  if (existing) return { field: "phone", error: "This number is already registered — log in instead." };

  const [a] = await db
    .insert(affiliates)
    .values({ code: await generateCode(name), name, phone, area, payoutMethod, payoutDetails, passwordHash: await hashSecret(password), rulesVersion: RULES_VERSION })
    .returning({ id: affiliates.id });
  await startSession("affiliate", a.id);
  redirect("/tora-mari/dashboard?welcome=1");
}

export async function login(_prev: FormState, f: FormData): Promise<FormState> {
  const r = await safely(() => loginInner(f));
  return r && { ...r, values: { phone: str(f, "phone") } };
}

async function loginInner(f: FormData): Promise<FormState> {
  const limit = await checkVisitor("login", await ip());
  if (!limit.ok) return { error: limit.message };
  const phone = normaliseZimMobile(str(f, "phone"));
  const password = String(f.get("password") ?? "").slice(0, 100);
  const fail = { error: "That number and password don't match. Check them, or ask us on WhatsApp to reset your password." };
  if (!phone || !password) return fail;
  const db = await getDb();
  const [a] = await db.select().from(affiliates).where(eq(affiliates.phone, phone));
  if (!a || !(await checkSecret(password, a.passwordHash))) return fail;
  await startSession("affiliate", a.id);
  redirect("/tora-mari/dashboard");
}

export async function logout() {
  await endSession("affiliate");
  redirect("/tora-mari");
}

/** Affiliate changes their own password from the dashboard */
export async function changeAffiliatePassword(_prev: FormState, f: FormData): Promise<FormState> {
  return safely(async () => {
    const { readSession } = await import("@/lib/server/auth");
    const id = await readSession("affiliate");
    if (!id) return { error: "Please log in again." };
    const current = String(f.get("current") ?? "");
    const next = String(f.get("next") ?? "");
    if (next.length < 8) return { field: "next", error: "Use a new password of at least 8 characters." };
    if (next !== String(f.get("confirm") ?? "")) return { field: "confirm", error: "The new passwords don't match." };
    const db = await getDb();
    const [a] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    if (!a || !(await checkSecret(current, a.passwordHash))) return { field: "current", error: "Your current password is wrong." };
    await db.update(affiliates).set({ passwordHash: await hashSecret(next) }).where(eq(affiliates.id, id));
    return { ok: "Password changed." };
  });
}
