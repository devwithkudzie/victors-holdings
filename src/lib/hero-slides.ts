import "server-only";
import type { HeroSlide } from "./hero";
import { unitText } from "./pricing";
import { products } from "./products";
import { resolveImage } from "./resolve-image";

/** Full-size hero photos for bricks that have them (wide for desktop, tall for phones) */
const HERO_PHOTOS: Record<string, { desktop: HeroSlide["desktop"]; mobile: HeroSlide["mobile"] }> = {
  "blue-heart-red-common-bricks": {
    desktop: { src: "/images/hero/blue-heart-desktop.jpg", position: "50% 55%" },
    mobile: { src: "/images/hero/blue-heart-mobile.jpg", position: "50% 30%" },
  },
  "smooth-red-common-bricks": {
    desktop: { src: "/images/hero/smooth-red-desktop.jpg", position: "60% 45%" },
    mobile: { src: "/images/hero/smooth-red-mobile.jpg", position: "50% 35%" },
  },
  "first-grade-blue-heart-red-common-bricks": {
    desktop: { src: "/images/hero/first-grade-blue-heart-desktop.jpg", position: "50% 18%" },
    mobile: { src: "/images/hero/first-grade-blue-heart-mobile.jpg", position: "50% 35%" },
  },
};

/** "US$100" for whole numbers, "US$0.38" otherwise */
const short = (n: number) => `US$${Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2)}`;

/**
 * Slide 1: nationwide delivery (truck photo).
 * Slides 2–4: bricks that have a full-size hero photo — discounted ones first (biggest saving first),
 * then the rest at their regular price. Add a photo to HERO_PHOTOS to include another brick.
 */
export function heroSlides(): HeroSlide[] {
  const delivery: HeroSlide = {
    id: "delivery",
    kind: "delivery",
    alt: "A truck loaded with pallets of bricks ready for delivery",
    desktop: { src: "/images/hero/delivery-truck.jpg", position: "40% 60%" },
    mobile: { src: "/images/hero/delivery-truck.jpg", position: "30% 60%" },
  };

  const deals = products
    .flatMap((p) => p.variants.map((v) => ({ p, v })))
    .filter(({ v }) => v.price != null && v.unit && HERO_PHOTOS[v.slug])
    .map((x) => ({ ...x, saving: x.v.was != null ? (x.v.was - x.v.price!) / x.v.was : 0 }))
    .sort((a, b) => b.saving - a.saving)
    .slice(0, 3);

  return [
    delivery,
    ...deals.map(({ p, v, saving }): HeroSlide => {
      const thumb = resolveImage(`catalog/${v.slug}`);
      const photo = HERO_PHOTOS[v.slug];
      const fallback = thumb ?? resolveImage(`product-${p.slug}-1`) ?? "/images/hero/delivery-truck.jpg";
      return {
        id: v.slug,
        kind: "deal",
        alt: `${v.name}`,
        desktop: photo?.desktop ?? { src: fallback },
        mobile: photo?.mobile ?? { src: fallback },
        blurBackground: !photo,
        deal: {
          name: v.name,
          now: short(v.price!),
          unit: unitText(v.unit!),
          was: v.was != null ? short(v.was) : undefined,
          save: saving > 0 ? `Save ${Math.round(saving * 100)}%` : undefined,
          href: `/products/${p.slug}#types`,
          thumb,
        },
      };
    }),
  ];
}
