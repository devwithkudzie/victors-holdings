import { site } from "./site";

export const customerTypes = ["Homeowner", "Contractor / Builder", "Developer", "Business / Institution"] as const;
/** Quantity option for customers who need help working out how much to order */
export const NOT_SURE = "Not sure — help me estimate";

export const timelines = ["As soon as possible", "This week", "This month", "Just checking prices"] as const;

export type Lead = {
  product: string;
  quantity: string;
  delivery: "deliver" | "collect";
  location: string;
  timeline: string;
  customerType: string;
  name: string;
  notes?: string;
  /** Where the lead came from, e.g. "Bricks ad" — shown at the bottom so Victors can attribute it */
  ref?: string;
};

/**
 * Formats a quote request as a WhatsApp message.
 * WhatsApp renders *text* as bold, so each detail is easy to scan.
 */
export function buildLeadMessage(lead: Lead) {
  const lines = [
    "Hi Victors Holdings 👋",
    "I'd like a quote for:",
    "",
    `*Product:* ${lead.product}`,
    `*Quantity:* ${lead.quantity}`,
    lead.delivery === "deliver" ? `*Delivery:* Deliver to ${lead.location}` : "*Delivery:* I'll collect",
    `*Needed:* ${lead.timeline}`,
    `*I am a:* ${lead.customerType}`,
    `*Name:* ${lead.name}`,
  ];
  if (lead.notes?.trim()) lines.push(`*Notes:* ${lead.notes.trim()}`);
  lines.push("", "Please send today's price and delivery cost. Thank you.");
  lines.push(`_Sent from ${site.url.replace(/^https?:\/\//, "")}${lead.ref ? ` · ${lead.ref}` : ""}_`);
  return lines.join("\n");
}
