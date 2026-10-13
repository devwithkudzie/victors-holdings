import { normaliseZimMobile } from "@/lib/phone";
import { deliverLead } from "@/lib/server/leads";
import { checkVisitor, clientIp, ESTIMATE_TTL_MS } from "@/lib/server/protection";
import { quotableBricks } from "@/lib/pricing";
import { buildQuote, customerTypes, sign, verify, type CustomerType, type EstimatePayload } from "@/lib/server/quote";

const fail = (status: number, field: string, message: string) => Response.json({ field, message }, { status });

/**
 * POST JSON { token, name, phone, customerType, product, consent, sendToWhatsApp }
 * Captures the lead, then returns the quotation and a link to its PDF.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return fail(400, "form", "Please try again.");
  // Hidden trap field: people never see it, form-filling bots fill it in
  if (body.website) return fail(400, "form", "Please try again.");
  const limit = await checkVisitor("quote", clientIp(req));
  if (!limit.ok) return fail(limit.status, "form", limit.message);

  const estimate = typeof body.token === "string" ? verify<EstimatePayload>(body.token) : null;
  if (!estimate || estimate.v !== 1 || Date.now() - Date.parse(estimate.createdAt) > ESTIMATE_TTL_MS) {
    return fail(400, "form", "Your estimate has expired — please start again.");
  }

  const name = String(body.name ?? "").trim().slice(0, 80);
  if (name.length < 2) return fail(400, "name", "Enter your name.");
  const phone = normaliseZimMobile(String(body.phone ?? ""));
  if (!phone) return fail(400, "phone", "Enter a valid Zimbabwean WhatsApp number, e.g. 077 123 4567.");
  const type = body.customerType as CustomerType;
  if (!customerTypes.includes(type)) return fail(400, "customerType", "Choose what best describes you.");
  const product = String(body.product ?? "");
  if (!quotableBricks().some((b) => b.name === product)) return fail(400, "product", "Choose a brick type.");
  if (body.consent !== true) return fail(400, "consent", "Please agree so we can send your quotation.");

  const quote = buildQuote(estimate, { name, phone, type }, product);
  const origin = new URL(req.url).origin;
  const pdfUrl = `${origin}/api/bricks/quote-pdf?t=${sign(quote)}`;
  const { autoSentToCustomer } = await deliverLead(quote, pdfUrl, { sendToCustomer: body.sendToWhatsApp === true });

  return Response.json({ quote, pdfUrl, autoSentToCustomer });
}
