export const site = {
  name: "Victors Holdings",
  tagline: "Building materials & construction solutions",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://victorsholdings.co.zw",
  location: "Harare, Zimbabwe",
  // TODO: replace with Victors' real WhatsApp number (digits only, international format)
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "263000000000",
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
