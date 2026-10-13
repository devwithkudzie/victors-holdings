import "server-only";
import { formatZimMobile } from "../phone";
import { money, type Quote } from "./quote";

/**
 * Lead delivery for the brick calculator.
 *
 * 1. WhatsApp alert to Victors — via the WhatsApp Business Platform (Cloud API).
 *    Switches on when these are set in Vercel:
 *      WHATSAPP_CLOUD_TOKEN        permanent access token
 *      WHATSAPP_PHONE_NUMBER_ID    ID of Victors' Cloud API sender number
 *      WHATSAPP_ALERT_TO           number that receives alerts, e.g. 263782086781
 *      WHATSAPP_LEAD_TEMPLATE      approved template; body params: {{1}} name, {{2}} number,
 *                                  {{3}} customer type, {{4}} bricks + product, {{5}} quote total
 * 2. Quote to the customer's WhatsApp (needs the customer's consent) — also Cloud API:
 *      WHATSAPP_QUOTE_TEMPLATE     approved template with a DOCUMENT header; body param {{1}} name
 * 3. Backup while the Cloud API isn't set up: LEAD_WEBHOOK_URL receives every lead as JSON
 *    (e.g. a Google Apps Script that appends a row to a Google Sheet).
 * Every lead is also written to the server log.
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v23.0";
const cloud = () => {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return token && phoneId ? { token, phoneId } : null;
};

async function sendTemplate(to: string, name: string, components: unknown[]) {
  const c = cloud();
  if (!c) return false;
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${c.phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "template", template: { name, language: { code: "en" }, components } }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error("[leads] WhatsApp send failed", res.status, await res.text().catch(() => ""));
  return res.ok;
}

const textParams = (...values: string[]) => ({ type: "body", parameters: values.map((text) => ({ type: "text", text })) });

export async function deliverLead(q: Quote, pdfUrl: string, opts: { sendToCustomer: boolean }) {
  const summary = `${q.quantity.toLocaleString("en-US")} × ${q.product}`;
  console.info("[lead] brick-calculator", JSON.stringify({ quote: q.number, name: q.customer.name, phone: q.customer.phone, type: q.customer.type, summary, total: q.total }));

  const tasks: Promise<unknown>[] = [];
  const alertTo = process.env.WHATSAPP_ALERT_TO;
  const leadTemplate = process.env.WHATSAPP_LEAD_TEMPLATE;
  if (alertTo && leadTemplate) {
    tasks.push(
      sendTemplate(alertTo, leadTemplate, [
        textParams(q.customer.name, formatZimMobile(q.customer.phone), q.customer.type, summary, money(q, q.total)),
      ]),
    );
  }
  const quoteTemplate = process.env.WHATSAPP_QUOTE_TEMPLATE;
  if (opts.sendToCustomer && quoteTemplate) {
    tasks.push(
      sendTemplate(q.customer.phone, quoteTemplate, [
        { type: "header", parameters: [{ type: "document", document: { link: pdfUrl, filename: `Victors-Holdings-Quotation-${q.number}.pdf` } }] },
        textParams(q.customer.name.split(" ")[0]),
      ]),
    );
  }
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    tasks.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "brick-calculator",
          quote: q.number,
          date: q.date,
          name: q.customer.name,
          whatsapp: q.customer.phone,
          customerType: q.customer.type,
          product: q.product,
          bricks: q.quantity,
          total: q.total,
          floorArea: q.estimate.floorArea,
          pdf: pdfUrl,
        }),
        signal: AbortSignal.timeout(8000),
      }).catch((e) => console.error("[leads] webhook failed", e)),
    );
  }
  // Never let a delivery problem stop the customer seeing their quote
  await Promise.allSettled(tasks);
  return { autoSentToCustomer: Boolean(opts.sendToCustomer && quoteTemplate && cloud()) };
}

export const autoSendEnabled = () => Boolean(cloud() && process.env.WHATSAPP_QUOTE_TEMPLATE);
