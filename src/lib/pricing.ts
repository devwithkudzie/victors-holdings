import { getProduct, type PriceUnit, type Variant } from "./products";

/** When the prices in products.ts were taken from Victors' WhatsApp catalogue — update with the prices */
export const PRICES_AS_OF = "October 2026";
export const CURRENCY = "US$";
/** How long a calculator quotation stays valid */
export const QUOTE_VALID_DAYS = 7;

const UNIT_LABEL: Record<PriceUnit, string> = {
  "per-1000": "per 1,000",
  each: "each",
  "per-m2": "per m²",
  "per-m3": "per m³",
};
/** Longer wording for messages and documents */
const UNIT_TEXT: Record<PriceUnit, string> = {
  "per-1000": "per 1,000 bricks",
  each: "each",
  "per-m2": "per square metre",
  "per-m3": "per cubic metre",
};

export const money = (n: number) => `${CURRENCY}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** "US$100.00 per 1,000" — or null when the item is "ask for price" */
export function priceLabel(v: Variant, long = false) {
  if (v.price == null || !v.unit) return null;
  return `${money(v.price)} ${(long ? UNIT_TEXT : UNIT_LABEL)[v.unit]}`;
}

export const unitText = (u: PriceUnit) => UNIT_TEXT[u];

/** Bricks the calculator can quote: common bricks priced per 1,000 */
export function quotableBricks() {
  return (getProduct("red-common-bricks")?.variants ?? [])
    .filter((v) => v.unit === "per-1000" && v.price != null)
    .map((v) => ({ name: v.name, pricePerThousand: v.price!, minOrder: v.minOrder ?? 0 }));
}
