"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RULES_VERSION } from "@/lib/affiliate-rules";
import { getDb } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { normaliseZimMobile } from "@/lib/phone";
import { generateCode } from "@/lib/server/affiliates";
import { checkSecret, endSession, hashSecret, startSession } from "@/lib/server/auth";
import { checkVisitor } from "@/lib/server/protection";

/** values: what the person typed (never the PIN), so the form can be refilled after an error */
export type FormState = { error?: string; field?: string; values?: Record<string, string> } | undefined;

const ip = async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
const str = (f: FormData, k: string, max = 120) => String(f.get(k) ?? "").trim().slice(0, max);

export async function register(_prev: FormState, f: FormData): Promise<FormState> {
  const r = await registerInner(f);
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
  const pin = str(f, "pin", 12);

  if (name.length < 2) return { field: "name", error: "Enter your full name." };
  if (!phone) return { field: "phone", error: "Enter a valid Zimbabwean WhatsApp number, e.g. 077 123 4567." };
  if (area.length < 2) return { field: "area", error: "Enter your town or area." };
  if (payoutDetails.length < 4) {
    return { field: "payoutDetails", error: payoutMethod === "ecocash" ? "Enter the EcoCash number and name it's registered in." : "Enter your bank, account name and account number." };
  }
  if (!/^\d{6}$/.test(pin)) return { field: "pin", error: "Choose a 6-digit PIN (numbers only)." };
  if (f.get("agree") !== "on") return { field: "agree", error: "Please agree to the rules and privacy notice." };

  const db = await getDb();
  const [existing] = await db.select({ id: affiliates.id }).from(affiliates).where(eq(affiliates.phone, phone));
  if (existing) return { field: "phone", error: "This number is already registered — log in instead." };

  const [a] = await db
    .insert(affiliates)
    .values({ code: await generateCode(name), name, phone, area, payoutMethod, payoutDetails, pinHash: await hashSecret(pin), rulesVersion: RULES_VERSION })
    .returning({ id: affiliates.id });
  await startSession("affiliate", a.id);
  redirect("/tora-mari/dashboard?welcome=1");
}

export async function login(_prev: FormState, f: FormData): Promise<FormState> {
  const r = await loginInner(f);
  return r && { ...r, values: { phone: str(f, "phone") } };
}

async function loginInner(f: FormData): Promise<FormState> {
  const limit = await checkVisitor("login", await ip());
  if (!limit.ok) return { error: limit.message };
  const phone = normaliseZimMobile(str(f, "phone"));
  const pin = str(f, "pin", 12);
  const fail = { error: "That number and PIN don't match. Check them, or ask us on WhatsApp to reset your PIN." };
  if (!phone || !pin) return fail;
  const db = await getDb();
  const [a] = await db.select().from(affiliates).where(eq(affiliates.phone, phone));
  if (!a || !(await checkSecret(pin, a.pinHash))) return fail;
  await startSession("affiliate", a.id);
  redirect("/tora-mari/dashboard");
}

export async function logout() {
  await endSession("affiliate");
  redirect("/tora-mari");
}
