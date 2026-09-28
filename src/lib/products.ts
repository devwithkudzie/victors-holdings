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
  /** false = listed in the mockup/brief but not yet confirmed by Victors */
  confirmed: boolean;
};

export const products: Product[] = [
  {
    slug: "red-common-bricks",
    name: "Red Common Bricks",
    summary: "Building bricks for residential and commercial construction.",
    description:
      "Dependable red common bricks for foundations, walls and everyday construction. Tell us how many you need and where you're building, and we'll confirm availability and delivery.",
    swatch: "brick",
    tag: "Available to order",
    uses: [
      "New homes and extensions",
      "Boundary and perimeter walls",
      "Commercial and multi-unit developments",
      "Foundations and plastered walls",
    ],
    highlights: [
      { title: "Consistent supply", body: "Order for a single build or schedule supply across a project." },
      { title: "Delivered to site", body: "Tell us your location and we'll arrange delivery in and around Harare." },
      { title: "Fast quotes", body: "Send your quantity on WhatsApp and get a response without chasing." },
    ],
    enquiryPrompt: "How many bricks do you need, and where is the site?",
    confirmed: true,
  },
  {
    slug: "pavers",
    name: "Pavers & Paving",
    summary: "Paving supply and installation for driveways, yards and walkways.",
    description:
      "Victors supplies pavers and provides paving solutions, including the preparation and finishing work needed for a clean, durable surface.",
    swatch: "paver",
    tag: "Supply & install",
    uses: ["Driveways", "Yards and courtyards", "Walkways and patios", "Commercial parking areas"],
    highlights: [
      { title: "Supply only or installed", body: "Buy pavers for your own team, or have Victors handle the job." },
      { title: "Proper base preparation", body: "A finished surface starts underneath — we prepare it correctly." },
      { title: "Clean finish", body: "Compacted and finished for a surface that lasts." },
    ],
    enquiryPrompt: "What area (in m²) are you paving, and do you need installation?",
    steps: [
      { title: "Plan", body: "Confirm the area, requirements and materials for the project." },
      { title: "Prepare", body: "Prepare the surface and establish the correct foundation." },
      { title: "Install", body: "Lay the paving with the appropriate bedding and alignment." },
      { title: "Finish", body: "Compact and finish the surface for a clean final result." },
    ],
    confirmed: true,
  },
  {
    slug: "sand",
    name: "Sand",
    summary: "Building and plaster sand for mixing, bedding and finishing.",
    description:
      "Sand for brickwork, plastering, concrete and paving bedding. Ask about current availability and load sizes.",
    swatch: "sand",
    tag: "Request availability",
    uses: ["Mortar for brickwork", "Plastering", "Concrete mixes", "Paving bedding"],
    highlights: [
      { title: "Matched to the job", body: "Tell us what it's for and we'll advise on the right sand." },
      { title: "Load sizes", body: "Ask about the load sizes available for your site." },
      { title: "Bundle with bricks", body: "Order alongside bricks for one coordinated delivery." },
    ],
    enquiryPrompt: "What type of sand and how many loads do you need?",
    confirmed: false,
  },
  {
    slug: "quarry-products",
    name: "Quarry Products",
    summary: "Aggregates and stone for concrete, foundations and site works.",
    description:
      "Quarry stone and aggregates for concrete, foundations, drainage and site preparation. Ask about current grades and availability.",
    swatch: "stone",
    tag: "Request availability",
    uses: ["Concrete and slabs", "Foundations", "Drainage", "Road and site preparation"],
    highlights: [
      { title: "Different grades", body: "Tell us the application and we'll confirm what's available." },
      { title: "Project quantities", body: "Supply for small builds through to larger developments." },
      { title: "One supplier", body: "Combine with bricks and sand to simplify your ordering." },
    ],
    enquiryPrompt: "What stone or aggregate do you need, and how much?",
    confirmed: false,
  },
  {
    slug: "cement-and-materials",
    name: "Cement & Other Materials",
    summary: "Talk to us about cement and other materials for your project.",
    description:
      "Need something that isn't listed? Send us your material list and we'll let you know what we can supply.",
    swatch: "cement",
    tag: "Talk to Victors",
    uses: ["General construction", "Renovations", "Contractor material lists", "Developer supply"],
    highlights: [
      { title: "Send your list", body: "Share your bill of materials and we'll respond with what we can supply." },
      { title: "Current availability", body: "Stock changes — we'll confirm what's available now." },
      { title: "Delivery support", body: "Arrange the most practical way to get materials to site." },
    ],
    enquiryPrompt: "What materials are on your list?",
    confirmed: false,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
