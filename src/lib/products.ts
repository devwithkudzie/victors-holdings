/** One specific item from Victors' WhatsApp catalogue, e.g. "Blue Heart Red Common Bricks". */
export type Variant = {
  slug: string;
  name: string;
  note?: string;
};

/** A product category with its own page at /products/<slug>. */
export type Product = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  swatch: "brick" | "paver" | "sand" | "stone" | "cement";
  /** Short label shown on the product card */
  tag: string;
  uses: string[];
  highlights: { title: string; body: string }[];
  /** Questions to ask the customer so the WhatsApp enquiry is useful */
  enquiryPrompt: string;
  steps?: { title: string; body: string }[];
  /** Quick-pick quantities in the quote form (customers can also type their own) */
  quantityOptions: string[];
  variants: Variant[];
};

// Product range from Victors' WhatsApp catalogue + Google Business Profile.
// No prices on the site: Victors' prices change often, so customers ask for today's price on WhatsApp.

export const products: Product[] = [
  {
    slug: "red-common-bricks",
    name: "Red Common Bricks",
    summary: "Blue Heart, smooth, first grade, load-bearing and farm bricks.",
    description:
      "Dependable red common bricks for foundations, walls and everyday construction. Tell us how many you need and where you're building, and we'll confirm availability and delivery.",
    swatch: "brick",
    tag: "Available to order",
    uses: [
      "New homes and extensions",
      "Boundary and perimeter walls",
      "Commercial, industrial and multi-unit developments",
      "Foundations and plastered walls",
    ],
    highlights: [
      { title: "Consistent supply", body: "Order for a single build or schedule supply across a project." },
      { title: "Delivered to site", body: "Delivery across Harare and surrounding areas, from our Mt Hampden yard." },
      { title: "Fast quotes", body: "Send your quantity on WhatsApp and get a response without chasing." },
    ],
    enquiryPrompt: "How many bricks do you need, and where is the site?",
    quantityOptions: ["5,000 bricks", "10,000 bricks", "20,000 bricks", "50,000+ bricks"],
    variants: [
      { slug: "blue-heart-red-common-bricks", name: "Blue Heart Red Common Bricks", note: "Minimum order 5,000 bricks" },
      { slug: "smooth-red-common-bricks", name: "Smooth Red Common Bricks", note: "Special offer" },
      { slug: "first-grade-blue-heart-red-common-bricks", name: "First Grade Blue Heart Red Common Bricks", note: "First grade quality" },
      { slug: "load-bearing-bricks", name: "Load Bearing Bricks", note: "Original certified load-bearing bricks" },
      { slug: "farm-bricks", name: "Farm Bricks (Semi Common)", note: "Build with confidence" },
    ],
  },
  {
    slug: "face-bricks",
    name: "Face Bricks",
    summary: "Rustic, smooth and Botswana face bricks for a finished look.",
    description:
      "Face bricks give walls a clean, finished look with no plaster or paint needed. Choose from rustic, smooth and Botswana ranges in a variety of colours.",
    swatch: "brick",
    tag: "In stock",
    uses: ["House facades", "Feature and boundary walls", "Gate pillars", "Commercial buildings"],
    highlights: [
      { title: "No plaster needed", body: "A finished face straight off the wall, saving on plaster and paint." },
      { title: "Range of finishes", body: "Rustic, smooth, granite, travertine and satin surfaces." },
      { title: "See before you buy", body: "Ask on WhatsApp for more photos of any colour or finish." },
    ],
    enquiryPrompt: "Which face brick do you like, and how many do you need?",
    quantityOptions: ["1,000 bricks", "5,000 bricks", "10,000 bricks", "20,000+ bricks"],
    variants: [
      { slug: "original-blue-heart-face-bricks", name: "Original Blue Heart Face Bricks" },
      { slug: "red-rustic-face-bricks", name: "Red Rustic Face Bricks", note: "In stock" },
      { slug: "blue-rustic-face-bricks", name: "Blue Rustic Face Bricks", note: "In stock" },
      { slug: "plum-brown-rustic-face-bricks", name: "Plum Brown Rustic Face Bricks", note: "In stock" },
      { slug: "botswana-full-granite-face-bricks", name: "Botswana Full Granite Face Bricks", note: "In stock" },
      { slug: "botswana-travertine-rough-face-bricks", name: "Botswana Travertine Rough Surface" },
      { slug: "botswana-satin-smooth-face-bricks", name: "Botswana Satin Smooth Surface" },
      { slug: "blue-rustic-multi", name: "Blue Rustic Multi" },
      { slug: "splashed-rustics", name: "Splashed Rustics" },
      { slug: "plum-brown-smooth-face-bricks", name: "Plum Brown Smooth Surface" },
    ],
  },
  {
    slug: "pavers",
    name: "Pavers & Paving",
    summary: "Pavers and paving installation for driveways, yards and walkways.",
    description:
      "Victors supplies pavers and provides paving services, including half-brick paving and the preparation and finishing work needed for a clean, durable surface.",
    swatch: "paver",
    tag: "Supply & install",
    uses: ["Driveways", "Yards and courtyards", "Walkways and patios", "Commercial parking areas"],
    highlights: [
      { title: "Supply only or installed", body: "Buy pavers for your own team, or have Victors handle the job." },
      { title: "Proper base preparation", body: "A finished surface starts underneath — we prepare it correctly." },
      { title: "Clean finish", body: "Compacted and finished for a surface that lasts." },
    ],
    enquiryPrompt: "What area (in m²) are you paving, and do you need installation?",
    quantityOptions: ["Under 50 m²", "50–100 m²", "100–300 m²", "300 m²+"],
    steps: [
      { title: "Plan", body: "Confirm the area, requirements and materials for the project." },
      { title: "Prepare", body: "Prepare the surface and establish the correct foundation." },
      { title: "Install", body: "Lay the paving with the appropriate bedding and alignment." },
      { title: "Finish", body: "Compact and finish the surface for a clean final result." },
    ],
    variants: [
      { slug: "interlocking-pavers", name: "Interlocking Pavers", note: "In stock" },
      { slug: "holland-pavers", name: "Holland Pavers", note: "In stock" },
      { slug: "paving-services", name: "Paving Services", note: "Upgrade your outdoor space" },
      { slug: "half-brick-paving", name: "Paving With Half Bricks", note: "Half-brick paving specialists" },
    ],
  },
  {
    slug: "sand",
    name: "Sand",
    summary: "River sand and pit sand for mixing, plastering and bedding.",
    description:
      "River sand and pit sand for brickwork, plastering, concrete and paving bedding. Tell us how much you need and where to deliver.",
    swatch: "sand",
    tag: "In stock",
    uses: ["Mortar for brickwork", "Plastering", "Concrete mixes", "Paving bedding"],
    highlights: [
      { title: "In stock", body: "River sand and pit sand available for delivery." },
      { title: "Load sizes", body: "Ask about the load sizes available for your site." },
      { title: "Bundle with bricks", body: "Order alongside bricks for one coordinated delivery." },
    ],
    enquiryPrompt: "How much sand do you need, and where is the site?",
    quantityOptions: ["1 load", "2 loads", "3–5 loads", "6+ loads"],
    variants: [
      { slug: "river-sand", name: "River Sand", note: "Available in stock" },
      { slug: "pit-sand", name: "Pit Sand" },
    ],
  },
  {
    slug: "quarry-products",
    name: "Quarry Products",
    summary: "Quarry stones, aggregates, quarry dust and crusher run.",
    description:
      "Quarry stones, aggregates, quarry dust and crusher run for concrete, foundations, bedding and site preparation, delivered to your site.",
    swatch: "stone",
    tag: "In stock",
    uses: ["Concrete and slabs", "Foundations", "Paving bedding", "Road and site preparation"],
    highlights: [
      { title: "Delivered by truck", body: "Loads delivered straight to your site." },
      { title: "Project quantities", body: "Supply for small builds through to larger developments." },
      { title: "One supplier", body: "Combine with bricks and sand to simplify your ordering." },
    ],
    enquiryPrompt: "Which quarry product do you need, and how much?",
    quantityOptions: ["1 load", "2 loads", "3–5 loads", "6+ loads"],
    variants: [
      { slug: "quarry-stones", name: "Quarry Stones / Aggregates", note: "For concrete, slabs and foundations" },
      { slug: "quarry-dust", name: "Quarry Dust" },
      { slug: "crusher-run", name: "Crusher Run", note: "Mixture of quarry dust and crushed stone" },
    ],
  },
  {
    slug: "cement-and-roofing",
    name: "Cement & Roofing",
    summary: "Cement, roofing materials and other construction essentials.",
    description:
      "Cement, roofing materials and the other essentials your build needs, from the same supplier as your bricks, sand and stone. Send your material list and we'll quote the lot.",
    swatch: "cement",
    tag: "Ask for availability",
    uses: ["Concrete and mortar", "Roofing new builds", "Renovations", "Contractor material lists"],
    highlights: [
      { title: "One supplier", body: "Bricks, sand, stone, cement and roofing on one order." },
      { title: "Send your list", body: "Share your bill of materials and we'll quote everything on it." },
      { title: "Delivered together", body: "Fewer deliveries to coordinate on site." },
    ],
    enquiryPrompt: "What materials are on your list?",
    quantityOptions: ["Small order", "Full house build", "Multiple units", "I'll send my list"],
    variants: [
      { slug: "cement", name: "Cement" },
      { slug: "roofing-materials", name: "Roofing Materials" },
      { slug: "other-construction-essentials", name: "Other Construction Essentials", note: "Send us your material list" },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
