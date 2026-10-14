import "server-only";
import fs from "node:fs";
import path from "node:path";
import { products } from "../products";

/** Top 3 catalogue deals (biggest saving first) for the flyers */
export function flyerDeals() {
  const short = (n: number) => `US$${Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2)}`;
  const unit = { "per-1000": "per 1,000", each: "each", "per-m2": "per m²", "per-m3": "per m³" } as const;
  return products
    .flatMap((p) => p.variants)
    .filter((v) => v.price != null && v.was != null && v.unit && v.unit !== "per-m2")
    .sort((a, b) => (b.was! - b.price!) / b.was! - (a.was! - a.price!) / a.was!)
    .slice(0, 3)
    .map((v) => ({ name: v.name, now: short(v.price!), unit: unit[v.unit!], was: short(v.was!) }));
}

/** A file from /public as a data URI (flyer images are drawn on the server) */
export function publicDataUri(rel: string) {
  const file = path.join(process.cwd(), "public", rel);
  const type = rel.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;
}

/** Plus Jakarta Sans (the site's heading font), fetched once from Google Fonts; falls back to the default font */
let fonts: Promise<{ name: string; data: ArrayBuffer; weight: 600 | 800; style: "normal" }[]> | null = null;
export function flyerFonts() {
  fonts ??= Promise.all(
    ([600, 800] as const).map(async (weight) => {
      const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@${weight}`, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
      const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
      if (!url) throw new Error("font url not found");
      return { name: "Jakarta", data: await (await fetch(url)).arrayBuffer(), weight, style: "normal" as const };
    }),
  ).catch((e) => {
    console.error("[flyer] font download failed, using default font", e);
    fonts = null;
    return [];
  });
  return fonts;
}

/** Flyer line-up: the featured brick (big, centre) and the products listed beside it — edit to change */
export const FLYER_FEATURE = "blue-heart-red-common-bricks";
/** Large photo for the featured brick (falls back to its catalogue photo) */
export const FLYER_FEATURE_PHOTO = "images/hero/blue-heart-mobile.jpg";
export const FLYER_LIST = [
  "first-grade-blue-heart-red-common-bricks",
  "load-bearing-bricks",
  "botswana-full-granite-face-bricks",
  "botswana-travertine-rough-face-bricks",
  "botswana-satin-smooth-face-bricks",
];

function flyerItems(slugs: string[]) {
  const all = products.flatMap((p) => p.variants);
  return slugs.map((slug) => all.find((v) => v.slug === slug))
    .filter((v) => v != null)
    .map((v) => {
      let img: string | null = null;
      try {
        img = publicDataUri(`images/catalog/${v.slug}.jpg`);
      } catch {}
      const short = (n: number) => `US$${Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2)}`;
      const unit = { "per-1000": "per 1,000", each: "each", "per-m2": "per m²", "per-m3": "per m³" } as const;
      return {
        name: v.name,
        img,
        price: v.price != null ? short(v.price) : null,
        unit: v.unit ? unit[v.unit] : "",
        was: v.was != null ? short(v.was) : null,
        save: v.was != null && v.price != null ? `SAVE ${Math.round(((v.was - v.price) / v.was) * 100)}%` : null,
      };
    });
}

/** The featured brick (with its large photo) and the list of other products */
export function flyerLineup() {
  const [feature] = flyerItems([FLYER_FEATURE]);
  let photo = feature?.img ?? null;
  try {
    photo = publicDataUri(FLYER_FEATURE_PHOTO);
  } catch {}
  return { feature: feature ? { ...feature, img: photo } : null, others: flyerItems(FLYER_LIST) };
}
