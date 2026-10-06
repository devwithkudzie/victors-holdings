const DEFAULT_URL = "https://victorsholdings.co.zw";

/** Tolerates an empty env var, a missing https:// and a trailing slash. */
function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_URL;
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return DEFAULT_URL;
  }
}

export const site = {
  name: "Victors Holdings",
  tagline: "Building materials & construction solutions",
  url: siteUrl(),
  // From Victors' Google Business Profile — keep in sync with it
  location: "Mt Hampden, Harare",
  address: { locality: "Mt Hampden", region: "Harare", country: "ZW" },
  delivery: "Delivering across Harare and surrounding areas, and further afield on request",
  googleReviewUrl: "https://g.page/r/CSsjOuMG0hMBEBM/review",
  // Digits only, international format. Override with NEXT_PUBLIC_WHATSAPP_NUMBER.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "263782086781",
  email: "", // TODO: add once confirmed
};

export const nav = [
  { href: "/products", label: "Products" },
  { href: "/products/pavers", label: "Paving" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp. On phones we navigate in the same tab so the WhatsApp app
 * opens straight away (a new tab often shows the wa.me "Continue to chat" page,
 * especially inside Facebook/Instagram browsers). On desktop, WhatsApp Web opens in a new tab.
 */
export function openWhatsApp(url: string) {
  const isPhone = window.matchMedia("(pointer: coarse)").matches;
  if (isPhone) window.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
}
