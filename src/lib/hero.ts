/** Homepage hero carousel — shared types and timing (safe to import in the browser) */

export type HeroImage = { src: string; position?: string };

export type HeroSlide = {
  id: string;
  alt: string;
  desktop: HeroImage;
  mobile: HeroImage;
  /** Background is a small catalogue photo: shown blurred, with the sharp photo in the price card */
  blurBackground?: boolean;
} & (
  | { kind: "delivery" }
  | { kind: "referral"; reward: string }
  | {
      kind: "deal";
      deal: {
        name: string;
        /** e.g. "US$100" */
        now: string;
        /** e.g. "per 1,000 bricks" */
        unit: string;
        /** Previous price and saving — only for discounted bricks */
        was?: string;
        /** e.g. "Save 35%" */
        save?: string;
        href: string;
        thumb?: string;
      };
    }
);

/** How long each slide plays before the next */
export const HERO_INTERVAL_MS = 6500;
/** Cross-fade length between slides */
export const HERO_FADE_MS = 600;
