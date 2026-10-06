"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { trackLead } from "@/lib/analytics";
import { buildLeadMessage, customerTypes, NOT_SURE, timelines, type Lead } from "@/lib/lead";
import { products, type Product } from "@/lib/products";
import { openWhatsApp, whatsappLink } from "@/lib/site";
import { useMenu } from "@/lib/useMenu";
import { IconChat, IconClose } from "./icons";


/** Every option in the product picker: each category ("not sure which") plus its items. */
const productOptions = products.flatMap((p) => [
  { value: p.name, label: p.variants.length > 1 ? `${p.name} (not sure which)` : p.name, category: p },
  ...(p.variants.length > 1 ? p.variants.map((v) => ({ value: v.name, label: v.name, category: p })) : []),
]);
const categoryOf = (value: string): Product | undefined =>
  productOptions.find((o) => o.value === value)?.category ?? products.find((p) => p.variants.some((v) => v.name === value));

/** Shows WhatsApp's *bold* and _italic_ markup the way WhatsApp will display it. */
function formatForPreview(text: string) {
  return text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g).map((part, i) =>
    /^\*.+\*$/.test(part) ? <b key={i}>{part.slice(1, -1)}</b> : /^_.+_$/.test(part) ? <i key={i}>{part.slice(1, -1)}</i> : part,
  );
}

export type LeadFormProps = {
  /** A specific item, e.g. "Blue Heart Red Common Bricks" — fixed, no picker shown */
  product?: string;
  /** Category slug to preselect in the picker, e.g. "red-common-bricks" */
  category?: string;
  /** Preselected quantity, e.g. "5,000 – 20,000 bricks" */
  quantity?: string;
  /** Analytics source label */
  source: string;
  /** Shown at the bottom of the WhatsApp message so Victors can see where the lead came from */
  leadRef?: string;
};

/**
 * The lead qualifier behind every quote form on the site. Collects product, quantity,
 * delivery, timing, customer type and name, then opens a formatted WhatsApp message.
 */
export function LeadForm({
  product: fixedProduct,
  category,
  quantity: presetQty,
  source,
  leadRef,
  inline = false,
  onSent,
}: LeadFormProps & { inline?: boolean; onSent?: () => void }) {
  const [product, setProduct] = useState(fixedProduct ?? products.find((p) => p.slug === category)?.name ?? "");
  const cat = categoryOf(product);
  const qtyOptions = cat?.quantityOptions ?? ["Small order", "Medium order", "Large order"];

  const presetIsOption = !!presetQty && (qtyOptions.includes(presetQty) || presetQty === NOT_SURE);
  const [quantity, setQuantity] = useState(presetQty ? (presetIsOption ? presetQty : "custom") : "");
  const [customQty, setCustomQty] = useState(presetQty && !presetIsOption ? presetQty : "");
  const [delivery, setDelivery] = useState<Lead["delivery"]>("deliver");
  const [location, setLocation] = useState("");
  const [timeline, setTimeline] = useState<string>(timelines[0]);
  const [customerType, setCustomerType] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const qty = quantity === "custom" ? customQty.trim() : quantity;
  const lead: Lead = { product, quantity: qty, delivery, location: location.trim(), timeline, customerType, name: name.trim(), notes, ref: leadRef };
  const message = buildLeadMessage(lead);
  const missing = [
    !product && "product",
    !qty && "quantity",
    delivery === "deliver" && !lead.location && "site location",
    !customerType && "who you are",
    !lead.name && "your name",
  ].filter(Boolean) as string[];

  function changeProduct(value: string) {
    if (categoryOf(value) !== cat && quantity !== "custom") setQuantity("");
    setProduct(value);
  }

  function send() {
    if (missing.length) return;
    trackLead(source, { product, category: cat?.slug, quantity: qty, delivery, timeline, customer_type: customerType });
    onSent?.();
    openWhatsApp(whatsappLink(message));
  }

  let step = 0;
  const n = () => `${++step}. `;

  return (
    <div className={`qs-body${inline ? " qs-inline" : ""}`}>
      {!fixedProduct && (
        <fieldset>
          <legend>{n()}What do you need?</legend>
          <select value={product} onChange={(e) => changeProduct(e.target.value)} aria-label="Product">
            <option value="" disabled>
              Choose a product…
            </option>
            {products.map((p) => (
              <optgroup key={p.slug} label={p.name}>
                {productOptions
                  .filter((o) => o.category === p)
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </fieldset>
      )}

      <fieldset>
        <legend>{n()}How much do you need?</legend>
        <div className="qs-chips">
          {[...qtyOptions, NOT_SURE].map((q) => (
            <button key={q} type="button" className={quantity === q ? "on" : undefined} onClick={() => setQuantity(q)}>
              {q}
            </button>
          ))}
          <button type="button" className={quantity === "custom" ? "on" : undefined} onClick={() => setQuantity("custom")}>
            Other amount
          </button>
        </div>
        {quantity === "custom" && (
          <input value={customQty} onChange={(e) => setCustomQty(e.target.value)} placeholder="e.g. 7,500 bricks or 3 loads" />
        )}
      </fieldset>

      <fieldset>
        <legend>{n()}Delivery or collection?</legend>
        <div className="qs-seg">
          <button type="button" className={delivery === "deliver" ? "on" : undefined} onClick={() => setDelivery("deliver")}>
            Deliver to my site
          </button>
          <button type="button" className={delivery === "collect" ? "on" : undefined} onClick={() => setDelivery("collect")}>
            I&apos;ll collect
          </button>
        </div>
        {delivery === "deliver" && (
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Suburb / area, e.g. Ruwa or Borrowdale"
            autoComplete="address-level2"
          />
        )}
      </fieldset>

      <fieldset>
        <legend>{n()}When do you need it?</legend>
        <div className="qs-chips">
          {timelines.map((t) => (
            <button key={t} type="button" className={timeline === t ? "on" : undefined} onClick={() => setTimeline(t)}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>{n()}About you</legend>
        <div className="qs-chips">
          {customerTypes.map((c) => (
            <button key={c} type="button" className={customerType === c ? "on" : undefined} onClick={() => setCustomerType(c)}>
              {c}
            </button>
          ))}
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else? (optional)" rows={2} />
      </fieldset>

      <details className="qs-preview">
        <summary>Preview your WhatsApp message</summary>
        <pre>{formatForPreview(message)}</pre>
      </details>

      <div className="qs-foot">
        {missing.length > 0 && <p className="qs-missing">Add {missing.join(", ")} to continue</p>}
        <button type="button" className="qs-send" disabled={missing.length > 0} onClick={send}>
          <IconChat size={20} />
          Send on WhatsApp
        </button>
      </div>
    </div>
  );
}

type QuoteButtonProps = LeadFormProps & {
  img?: string;
  label?: React.ReactNode;
  className?: string;
};

/** Every "Get a quote" button: opens the lead qualifier in a bottom sheet. */
export function QuoteButton({ label = "Get a Quote on WhatsApp →", className = "primary", img, ...form }: QuoteButtonProps) {
  const { open, setOpen, close } = useMenu();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      {mounted && open && createPortal(<QuoteSheet {...form} img={img} onClose={close} />, document.body)}
    </>
  );
}

/** "Ask" button on catalogue items. */
export function AskButton(props: QuoteButtonProps) {
  return <QuoteButton label="Ask" className="variant-ask" {...props} />;
}

function QuoteSheet({ img, onClose, ...form }: LeadFormProps & { img?: string; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const title = form.product ?? products.find((p) => p.slug === form.category)?.name ?? "Building materials";

  return (
    <div className="qs-root" role="dialog" aria-modal="true" aria-label={`Get a quote for ${title}`}>
      <div className="qs-scrim" onClick={onClose} />
      <div className="qs-panel">
        <div className="qs-head">
          {img && (
            <span className="qs-thumb">
              <Image src={img} alt="" fill sizes="48px" />
            </span>
          )}
          <div>
            <small>Get today&apos;s price</small>
            <b>{title}</b>
          </div>
          <button type="button" className="qs-close" onClick={onClose} aria-label="Close">
            <IconClose size={20} />
          </button>
        </div>

        {sent ? (
          <div className="qs-sent">
            <span className="qs-sent-icon">
              <IconChat size={28} />
            </span>
            <h3>Almost done — press Send in WhatsApp</h3>
            <p>Your quote request is ready in WhatsApp. Victors will reply with today&apos;s price and delivery cost.</p>
            <button type="button" className="qs-link" onClick={onClose}>
              Back to the website
            </button>
          </div>
        ) : (
          <LeadForm {...form} onSent={() => setSent(true)} />
        )}
      </div>
    </div>
  );
}
