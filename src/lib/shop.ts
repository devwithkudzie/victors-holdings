import "server-only";
import { productImage } from "./images";
import { money, priceLabel } from "./pricing";
import { products } from "./products";
import { resolveImage } from "./resolve-image";

/** Brick types shown in "Shop bricks by type" (category slug → tab label) */
const BRICK_TYPES = [
  { category: "red-common-bricks", label: "Common bricks" },
  { category: "face-bricks", label: "Face bricks" },
  { category: "pavers", label: "Pavers" },
] as const;

export type ShopItem = {
  key: string;
  name: string;
  note?: string;
  type: string;
  img?: string;
  price: string | null;
  was: string | null;
  /** e.g. "Save 35%" when the catalogue shows a lower price than before */
  save: string | null;
  href: string;
};

/** Every brick product (not services), ready for the homepage grids */
export function shopItems(): ShopItem[] {
  return BRICK_TYPES.flatMap(({ category, label }) => {
    const p = products.find((x) => x.slug === category);
    if (!p) return [];
    return p.variants
      .filter((v) => v.unit !== "per-m2") // paving services are labour, not bricks
      .map((v) => ({
        key: v.slug,
        name: v.name,
        note: v.note,
        type: label,
        img: resolveImage(`catalog/${v.slug}`) ?? resolveImage(productImage(category)),
        price: priceLabel(v),
        was: v.was != null ? money(v.was) : null,
        save: v.was != null && v.price != null ? `Save ${Math.round(((v.was - v.price) / v.was) * 100)}%` : null,
        href: `/products/${category}#types`,
      }));
  });
}

export const brickTypes = BRICK_TYPES.map((t) => t.label);
