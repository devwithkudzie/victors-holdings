"use client";

import { useState } from "react";
import { trackLead } from "@/lib/analytics";
import { products } from "@/lib/products";
import { whatsappLink } from "@/lib/site";

type Props = {
  /** Analytics source label, e.g. "campaign_red_common_bricks" */
  source: string;
  defaultProduct?: string;
  /** Opening line of the WhatsApp message — lets Victors see where the lead came from */
  intro?: string;
  quantityLabel?: string;
  quantityPlaceholder?: string;
  submitLabel?: string;
};

const timelines = ["As soon as possible", "Within 2 weeks", "Within a month", "Just getting prices"];

export function EnquiryForm({
  source,
  defaultProduct = products[0].name,
  intro = "Hi Victors, I'd like a quote.",
  quantityLabel = "Quantity",
  quantityPlaceholder = "e.g. 10,000 bricks",
  submitLabel = "Send enquiry on WhatsApp →",
}: Props) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();

    const lines = [
      intro,
      "",
      `Name: ${get("name")}`,
      `Product: ${get("product")}`,
      `Quantity: ${get("quantity")}`,
      `Site location: ${get("location")}`,
      `Needed: ${get("timeline")}`,
    ];
    if (get("notes")) lines.push(`Notes: ${get("notes")}`);

    trackLead(source, { product: get("product") });
    window.open(whatsappLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <form className="enquiry" onSubmit={onSubmit}>
      <div className="field-row">
        <label>
          Your name
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Product
          <select name="product" defaultValue={defaultProduct}>
            {products.map((p) => (
              <option key={p.slug}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="field-row">
        <label>
          {quantityLabel}
          <input name="quantity" required placeholder={quantityPlaceholder} />
        </label>
        <label>
          Where are you building?
          <input name="location" required placeholder="e.g. Borrowdale, Harare" />
        </label>
      </div>
      <label>
        When do you need it?
        <select name="timeline" defaultValue={timelines[0]}>
          {timelines.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Anything else? <span className="optional">(optional)</span>
        <textarea name="notes" rows={3} />
      </label>
      <button type="submit" className="primary">
        {submitLabel}
      </button>
      {sent && (
        <p className="form-note">
          WhatsApp should have opened with your enquiry. Press send there and Victors will get back to you.
        </p>
      )}
    </form>
  );
}
