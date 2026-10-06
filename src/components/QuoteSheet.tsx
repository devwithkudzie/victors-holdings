"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trackLead } from "@/lib/analytics";
import { buildLeadMessage, customerTypes, NOT_SURE, timelines, type Lead } from "@/lib/lead";
import { products } from "@/lib/products";
import { openWhatsApp, whatsappLink } from "@/lib/site";
import { useMenu } from "@/lib/useMenu";
import { IconChat, IconClose } from "./icons";
import { anyOf, ProductPicker, selectionCategory, selectionLabel } from "./ProductPicker";


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
  const preCat = products.find((p) => p.slug === category);
  const [selected, setSelected] = useState<string[]>(fixedProduct ? [fixedProduct] : preCat ? [anyOf(preCat)] : []);
  const productNames = selected.map(selectionLabel);
  const cats = [...new Set(selected.map(selectionCategory).filter((c) => c != null))];
  const cat = cats.length === 1 ? cats[0] : undefined;
  /** Several categories chosen → customers type their quantities instead of picking one */
  const multiCategory = cats.length > 1;
  const qtyOptions = multiCategory ? [] : (cat?.quantityOptions ?? ["Small order", "Medium order", "Large order"]);

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
  const lead: Lead = { products: productNames, quantity: qty, delivery, location: location.trim(), timeline, customerType, name: name.trim(), notes, ref: leadRef };
  const message = buildLeadMessage(lead);
  const [tried, setTried] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const missing = {
    product: selected.length === 0,
    quantity: !qty,
    location: delivery === "deliver" && !lead.location,
    customerType: !customerType,
    name: !lead.name,
  };
  const firstMissing = (Object.keys(missing) as (keyof typeof missing)[]).find((k) => missing[k]);
  /** Marks an unanswered question after the visitor taps Send */
  const flag = (...keys: (keyof typeof missing)[]) => (tried && keys.some((k) => missing[k]) ? "is-missing" : undefined);
  const req = (show: boolean) => (tried && show ? <em className="qs-req">Required</em> : null);

  function changeProducts(next: string[]) {
    const nextCats = new Set(next.map(selectionCategory));
    if (nextCats.size > 1) {
      if (quantity !== NOT_SURE) setQuantity("custom");
    } else if (quantity !== "custom" && quantity !== NOT_SURE && !(cat && nextCats.has(cat))) {
      setQuantity("");
    }
    setSelected(next);
  }

  function send() {
    if (firstMissing) {
      // Take the visitor straight to the first unanswered question
      setTried(true);
      const el = root.current?.querySelector<HTMLElement>(`[data-field="${firstMissing}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
      return;
    }
    trackLead(source, { product: productNames.join(", "), category: cats.map((c) => c.slug).join(","), quantity: qty, delivery, timeline, customer_type: customerType });
    onSent?.();
    openWhatsApp(whatsappLink(message));
  }

  let step = 0;
  const n = () => `${++step}. `;

  return (
    <div className={`qs-body${inline ? " qs-inline" : ""}`} ref={root}>
      {!fixedProduct && (
        <fieldset data-field="product" className={flag("product")}>
          <legend>
            {n()}What do you need? <small className="qs-hint">Choose one or more</small> {req(missing.product)}
          </legend>
          <ProductPicker value={selected} onChange={changeProducts} invalid={tried && missing.product} />
        </fieldset>
      )}

      <fieldset data-field="quantity" className={flag("quantity")}>
        <legend>
          {n()}How much do you need? {req(missing.quantity)}
        </legend>
        <div className="qs-chips">
          {[...qtyOptions, NOT_SURE].map((q) => (
            <button key={q} type="button" className={quantity === q ? "on" : undefined} onClick={() => setQuantity(q)}>
              {q}
            </button>
          ))}
          <button type="button" className={quantity === "custom" ? "on" : undefined} onClick={() => setQuantity("custom")}>
            {multiCategory ? "Type quantities" : "Other amount"}
          </button>
        </div>
        {quantity === "custom" && (
          <input
            value={customQty}
            onChange={(e) => setCustomQty(e.target.value)}
            placeholder={multiCategory ? "e.g. 10,000 bricks + 2 loads river sand" : "e.g. 7,500 bricks or 3 loads"}
            enterKeyHint="next"
          />
        )}
      </fieldset>

      <fieldset className={flag("location")}>
        <legend>
          {n()}Delivery or collection? {req(missing.location)}
        </legend>
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
            data-field="location"
            className={tried && missing.location ? "is-missing" : undefined}
            enterKeyHint="next"
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

      <fieldset data-field="customerType" className={flag("customerType")}>
        <legend>
          {n()}About you {req(missing.customerType || missing.name)}
        </legend>
        <div className="qs-chips">
          {customerTypes.map((c) => (
            <button key={c} type="button" className={customerType === c ? "on" : undefined} onClick={() => setCustomerType(c)}>
              {c}
            </button>
          ))}
        </div>
        <input
          data-field="name"
          className={tried && missing.name ? "is-missing" : undefined}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          enterKeyHint="done"
        />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else? (optional)" rows={1} />
      </fieldset>

      <div className="qs-foot">
        {tried && firstMissing && <p className="qs-missing">Please answer the questions marked Required</p>}
        <button type="button" className="qs-send" onClick={send}>
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
