import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { BrickEstimate } from "../bricks";
import { CURRENCY, QUOTE_VALID_DAYS, quotableBricks } from "../pricing";

export const customerTypes = ["Builder", "Contractor", "Building my own home"] as const;
export type CustomerType = (typeof customerTypes)[number];

export type Quote = {
  number: string;
  date: string;
  validUntil: string;
  customer: { name: string; phone: string; type: CustomerType };
  product: string;
  quantity: number;
  pricePerThousand: number;
  total: number;
  currency: string;
  minimumOrderApplied: boolean;
  estimate: Pick<BrickEstimate, "total" | "range" | "lines" | "wastage" | "assumptions" | "confidence" | "floorArea" | "source">;
  planName?: string;
};

/* ---------- Signed tokens (no database needed) ---------- */

function secret() {
  const s = process.env.QUOTE_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("QUOTE_SECRET is not set");
  return "dev-only-quote-secret";
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const mac = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export function sign(payload: unknown): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${mac(body)}`;
}

export function verify<T>(token: string): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = mac(body);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

/* ---------- Quote building ---------- */

export type EstimatePayload = { v: 1; estimate: BrickEstimate; planName?: string; createdAt: string };

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function buildQuote(est: EstimatePayload, customer: Quote["customer"], product: string): Quote {
  const brick = quotableBricks().find((b) => b.name === product);
  if (!brick) throw new Error("Unknown product");
  const { pricePerThousand, minOrder: minimum } = brick;
  const quantity = Math.max(est.estimate.total, minimum);
  const now = new Date();
  const valid = new Date(now.getTime() + QUOTE_VALID_DAYS * 86_400_000);
  const { total, range, lines, wastage, assumptions, confidence, floorArea, source } = est.estimate;

  return {
    number: `VH-${isoDate(now).replace(/-/g, "").slice(2)}-${randomBytes(2).toString("hex").toUpperCase()}`,
    date: isoDate(now),
    validUntil: isoDate(valid),
    customer,
    product,
    quantity,
    pricePerThousand,
    total: Math.round((quantity / 1000) * pricePerThousand * 100) / 100,
    currency: CURRENCY,
    minimumOrderApplied: quantity > est.estimate.total,
    estimate: { total, range, lines, wastage, assumptions, confidence, floorArea, source },
    planName: est.planName,
  };
}

export const money = (q: Pick<Quote, "currency">, n: number) =>
  `${q.currency}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
