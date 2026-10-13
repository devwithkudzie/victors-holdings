import { money, priceLabel } from "./pricing";
import { products, type Variant } from "./products";

export type PriceEstimate = {
  /** e.g. "US$500.00" or "US$500.00 – US$1,000.00" */
  total: string;
  /** e.g. "5,000 × US$100.00 per 1,000" */
  working: string;
  /** e.g. "Minimum order is 5,000 bricks" */
  note?: string;
};

const findVariant = (name: string): Variant | undefined =>
  products.flatMap((p) => p.variants).find((v) => v.name === name);

const num = (s: string) => Number(s.replace(/,/g, ""));
const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * Works out an indicative cost from the catalogue price and the quantity the customer chose.
 * Returns null when it can't be done honestly: no price, "not sure", "under …", loads of unknown size,
 * or a quantity in a different unit from the price.
 */
export function estimatePrice(productName: string, quantity: string): PriceEstimate | null {
  const v = findVariant(productName);
  if (!v || v.price == null || !v.unit) return null;
  const q = quantity.trim().toLowerCase();
  if (!q || q.startsWith("not sure") || q.startsWith("under")) return null;

  const isArea = /m²|m2|sq/.test(q);
  const isVolume = /m³|m3|cubic/.test(q);
  if (/load/.test(q)) return null; // load sizes vary — Victors confirms
  // The quantity must be in the same unit as the price
  if (v.unit === "per-m2" ? !isArea : v.unit === "per-m3" ? !isVolume : isArea || isVolume) return null;

  const nums = [...q.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => num(m[0])).filter((n) => n > 0);
  if (!nums.length) return null;
  const low = nums[0];
  const high = nums.length > 1 && /[–-]|to/.test(q) ? nums[1] : null;
  const atLeast = q.includes("+");

  const cost = (n: number) => (v.unit === "per-1000" ? (n / 1000) * v.price! : n * v.price!);
  const qtyText = high ? `${fmt(low)}–${fmt(high)}` : `${fmt(low)}${atLeast ? "+" : ""}`;

  let note: string | undefined;
  if (v.minOrder && low < v.minOrder) {
    note = `Minimum order is ${fmt(v.minOrder)} bricks (${money(cost(v.minOrder))})`;
  }

  return {
    total: high ? `${money(cost(low))} – ${money(cost(high))}` : `${atLeast ? "From " : ""}${money(cost(low))}`,
    working: `${qtyText} × ${priceLabel(v)}`,
    note,
  };
}
