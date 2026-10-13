import { faqs } from "@/lib/faq";
import { priceLabel, PRICES_AS_OF } from "@/lib/pricing";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

/**
 * /llms.txt — a plain-text summary for AI assistants (ChatGPT, Gemini, Google AI Mode…),
 * generated from the same data as the site so it never goes out of date.
 */
export const dynamic = "force-static";

/** Catalogue notes that are promotional or time-limited — left out so AI assistants don't repeat stale offers */
const PROMO = /offer|confidence/i;

export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> Building materials supplier based in ${site.location}, Zimbabwe. Supplies builders, contractors, developers and homeowners for residential, commercial and industrial projects. ${site.delivery}.`,
    "",
    "## Key facts",
    `- Location: ${site.location}, Zimbabwe`,
    `- Orders and quotes: WhatsApp +${site.whatsapp}`,
    `- Prices below are from Victors' WhatsApp catalogue (${PRICES_AS_OF}), in US dollars, excluding delivery. Prices can change; Victors confirms the final price when you order.`,
    `- Website: ${site.url}`,
    "",
    "## Products",
    ...products.flatMap((p) => [
      `- [${p.name}](${site.url}/products/${p.slug}): ${p.summary}`,
      ...p.variants.map((v) => `  - ${v.name}: ${priceLabel(v, true) ?? "ask for price"}${v.note && !PROMO.test(v.note) ? ` (${v.note})` : ""}`),
    ]),
    "",
    "## Frequently asked questions",
    ...faqs.flatMap((f) => [`### ${f.q}`, f.a, ""]),
    "## Pages",
    `- [Products](${site.url}/products)`,
    `- [Free brick calculator](${site.url}/brick-calculator): upload a house plan to estimate the number of bricks needed and get a quotation`,
    `- [About](${site.url}/about)`,
    `- [FAQ](${site.url}/faq)`,
    `- [Contact & quotes](${site.url}/contact)`,
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
