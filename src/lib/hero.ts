/**
 * Homepage hero carousel slides. To add a brick type, add an entry here
 * and put its photos in /public/images/hero/.
 *
 * desktop: a wide (landscape) photo works best · mobile: a tall (portrait) photo.
 * position: which part of the photo stays in view when it's cropped (CSS object-position).
 */
export type HeroSlide = {
  id: string;
  name: string;
  tagline: string;
  /** Exact catalogue item name — preselected when the customer taps "WhatsApp Us" */
  product: string;
  alt: string;
  desktop: { src: string; position?: string };
  mobile: { src: string; position?: string };
};

export const heroSlides: HeroSlide[] = [
  {
    id: "blue-heart",
    name: "Blue Heart",
    tagline: "A trusted choice for your next build.",
    product: "Blue Heart Red Common Bricks",
    alt: "Pallets of Blue Heart red common bricks at the Victors Holdings yard",
    desktop: { src: "/images/hero/blue-heart-desktop.jpg", position: "50% 55%" },
    mobile: { src: "/images/hero/blue-heart-mobile.jpg", position: "50% 30%" },
  },
  {
    id: "smooth-red",
    name: "Smooth Red",
    tagline: "A clean finish for your construction project.",
    product: "Smooth Red Common Bricks",
    alt: "Smooth Red common bricks stacked on pallets, supplied by Victors Holdings",
    desktop: { src: "/images/hero/smooth-red-desktop.jpg", position: "60% 45%" },
    mobile: { src: "/images/hero/smooth-red-mobile.jpg", position: "50% 35%" },
  },
  {
    id: "first-grade-blue-heart",
    name: "First Grade Blue Heart",
    tagline: "For projects where finish and presentation matter.",
    product: "First Grade Blue Heart Red Common Bricks",
    alt: "A pallet of First Grade Blue Heart red common bricks",
    desktop: { src: "/images/hero/first-grade-blue-heart-desktop.jpg", position: "50% 18%" },
    mobile: { src: "/images/hero/first-grade-blue-heart-mobile.jpg", position: "50% 35%" },
  },
];

/** How long each photo plays before cutting to the next */
export const HERO_INTERVAL_MS = 5500;
/** Cross-fade length between photos */
export const HERO_FADE_MS = 600;
