/**
 * Every photo on the site lives in /public/images with a fixed name.
 * To replace a photo, drop a new file into /public/images with the SAME name —
 * .jpg, .jpeg, .png or .webp all work.
 * If a file is missing, the site falls back to a brick/stone texture.
 * See /public/images/README.md for the full list.
 */
import { resolveImage } from "./resolve-image";

export const images = {
  homeHero: "home-hero",
  campaignHero: "campaign-red-common-bricks-hero",
  about: "about",
};

export const MAX_PRODUCT_PHOTOS = 5;

/** Main product photo: product-<slug>-1 */
export function productImage(slug: string) {
  return `product-${slug}-1`;
}

/** All photos that exist for a product: product-<slug>-1 … product-<slug>-5 */
export function productGallery(slug: string) {
  const found: string[] = [];
  for (let i = 1; i <= MAX_PRODUCT_PHOTOS; i++) {
    const src = resolveImage(`product-${slug}-${i}`);
    if (src) found.push(src);
  }
  return found;
}
