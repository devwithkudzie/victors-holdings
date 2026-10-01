"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { trackLead } from "@/lib/analytics";
import { buildLeadMessage, customerTypes, timelines, type Lead } from "@/lib/lead";
import { whatsappLink } from "@/lib/site";
import { useMenu } from "@/lib/useMenu";
import { IconChat, IconClose } from "./icons";

const NOT_SURE = "Not sure — help me estimate";

/** Shows WhatsApp's *bold* and _italic_ markup the way WhatsApp will display it. */
function formatForPreview(text: string) {
  return text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g).map((part, i) =>
    /^\*.+\*$/.test(part) ? <b key={i}>{part.slice(1, -1)}</b> : /^_.+_$/.test(part) ? <i key={i}>{part.slice(1, -1)}</i> : part,
  );
}

type Props = {
  /** The specific item, e.g. "Blue Heart Red Common Bricks" */
  product: string;
  img?: string;
  quantityOptions: string[];
  /** Analytics source label */
  source: string;
  /** Shown at the bottom of the WhatsApp message so Victors can see where the lead came from */
  leadRef?: string;
  label?: string;
  className?: string;
};

/** "Ask" button that opens a short lead-qualifying form, then sends a formatted WhatsApp message. */
export function AskButton({ label = "Ask", className = "variant-ask", ...sheet }: Props) {
  const { open, setOpen, close } = useMenu();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      {mounted && open && createPortal(<QuoteSheet {...sheet} onClose={close} />, document.body)}
    </>
  );
}

function QuoteSheet({ product, img, quantityOptions, source, leadRef, onClose }: Omit<Props, "label" | "className"> & { onClose: () => void }) {
  const [quantity, setQuantity] = useState("");
  const [customQty, setCustomQty] = useState("");
  const [delivery, setDelivery] = useState<Lead["delivery"]>("deliver");
  const [location, setLocation] = useState("");
  const [timeline, setTimeline] = useState<string>(timelines[0]);
  const [customerType, setCustomerType] = useState<string>("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const qty = quantity === "custom" ? customQty.trim() : quantity;
  const lead: Lead = { product, quantity: qty, delivery, location: location.trim(), timeline, customerType, name: name.trim(), notes, ref: leadRef };
  const message = buildLeadMessage(lead);

  const missing = [
    !qty && "quantity",
    delivery === "deliver" && !lead.location && "site location",
    !customerType && "who you are",
    !lead.name && "your name",
  ].filter(Boolean) as string[];

  const openWhatsApp = () => window.open(whatsappLink(message), "_blank", "noopener,noreferrer");

  function send() {
    if (missing.length) return;
    trackLead(source, { product, quantity: qty, delivery, timeline, customer_type: customerType });
    openWhatsApp();
    setSent(true);
  }

  return (
    <div className="qs-root" role="dialog" aria-modal="true" aria-label={`Get a quote for ${product}`}>
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
            <b>{product}</b>
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
            <button type="button" className="primary" onClick={openWhatsApp}>
              Open WhatsApp again
            </button>
            <button type="button" className="qs-link" onClick={onClose}>
              Back to products
            </button>
          </div>
        ) : (
          <div className="qs-body">
            <fieldset>
              <legend>1. How much do you need?</legend>
              <div className="qs-chips">
                {[...quantityOptions, NOT_SURE].map((q) => (
                  <button key={q} type="button" className={quantity === q ? "on" : undefined} onClick={() => setQuantity(q)}>
                    {q}
                  </button>
                ))}
                <button type="button" className={quantity === "custom" ? "on" : undefined} onClick={() => setQuantity("custom")}>
                  Other amount
                </button>
              </div>
              {quantity === "custom" && (
                <input autoFocus value={customQty} onChange={(e) => setCustomQty(e.target.value)} placeholder="e.g. 7,500 bricks" />
              )}
            </fieldset>

            <fieldset>
              <legend>2. Delivery or collection?</legend>
              <div className="qs-seg">
                <button type="button" className={delivery === "deliver" ? "on" : undefined} onClick={() => setDelivery("deliver")}>
                  Deliver to my site
                </button>
                <button type="button" className={delivery === "collect" ? "on" : undefined} onClick={() => setDelivery("collect")}>
                  I&apos;ll collect
                </button>
              </div>
              {delivery === "deliver" && (
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Suburb / area, e.g. Ruwa or Borrowdale" autoComplete="address-level2" />
              )}
            </fieldset>

            <fieldset>
              <legend>3. When do you need it?</legend>
              <div className="qs-chips">
                {timelines.map((t) => (
                  <button key={t} type="button" className={timeline === t ? "on" : undefined} onClick={() => setTimeline(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>4. About you</legend>
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
        )}
      </div>
    </div>
  );
}
