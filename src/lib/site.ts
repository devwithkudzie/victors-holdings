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
  location: "Harare, Zimbabwe",
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
