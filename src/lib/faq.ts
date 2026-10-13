import { money, PRICES_AS_OF } from "./pricing";
import { getProduct, products } from "./products";
import { site } from "./site";

/**
 * Customer FAQs — used on /faq, in its structured data and in /llms.txt.
 * Only facts confirmed by Victors (Google Business Profile, WhatsApp catalogue, customer chats).
 * TODO once Victors confirms: payment methods, opening hours, collection from the yard, referral rewards.
 */
function priceAnswer() {
  const bricks = (getProduct("red-common-bricks")?.variants ?? []).filter((v) => v.price != null);
  const low = Math.min(...bricks.map((v) => v.price!));
  const high = Math.max(...bricks.map((v) => v.price!));
  return `Red common bricks range from ${money(low)} to ${money(high)} per 1,000 bricks, depending on the type. Every product page lists current prices from our WhatsApp catalogue (${PRICES_AS_OF}). Prices can change and delivery is charged separately, so we confirm the final price and delivery cost when you order.`;
}

export const faqs: { q: string; a: string }[] = [
  {
    q: "What does Victors Holdings sell?",
    a: `Building materials for residential, commercial and industrial projects: ${products
      .map((p) => p.name.toLowerCase())
      .join(", ")}. See the full range on our products page.`,
  },
  {
    q: "Where is Victors Holdings based?",
    a: `Our yard is in ${site.location}, Zimbabwe.`,
  },
  {
    q: "Do you deliver?",
    a: "Yes. We deliver to sites across Harare and surrounding areas, and further afield on request. Customers have had bricks delivered as far as Kadoma and Mt Darwin. Tell us your site location when you ask for a quote and we'll confirm the delivery cost and timing.",
  },
  {
    q: "How much do your bricks cost?",
    a: priceAnswer(),
  },
  {
    q: "Is there a minimum order?",
    a: "Blue Heart Red Common Bricks have a minimum order of 5,000 bricks. For other products, tell us what you need and we'll confirm.",
  },
  {
    q: "How do I order?",
    a: "Tap Get a quote, choose your products, quantity and site location, and send the request on WhatsApp. We'll confirm availability, price and delivery, then arrange delivery to your site.",
  },
  {
    q: "I'm not sure how many bricks I need. Can you help?",
    a: "Yes. Choose “Not sure — help me estimate” in the quote form and tell us about your project, and we'll help you work out the quantity.",
  },
  {
    q: "Do you install paving?",
    a: "Yes. As well as supplying interlocking and Holland pavers, we offer paving services, including half-brick paving.",
  },
  {
    q: "Who do you supply?",
    a: "Builders, contractors, property developers and homeowners, for residential, commercial and industrial projects.",
  },
];
