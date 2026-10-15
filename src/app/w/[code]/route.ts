import { findAffiliateByCode, recordClick, recordLead } from "@/lib/server/affiliates";
import { PREVIEW_BOTS, previewPage } from "@/lib/server/link-preview";
import { whatsappLink } from "@/lib/site";

/**
 * Straight-to-WhatsApp referral link: /w/TENDAI20
 * Records the click, then opens a WhatsApp chat with Victors with the affiliate's code already in the message,
 * for customers who would rather chat than visit the website.
 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const url = new URL(req.url);
  const ua = req.headers.get("user-agent") ?? "";
  const affiliate = await findAffiliateByCode(code).catch(() => null);
  const dest = whatsappLink(`Hi Victors Holdings, I'd like a quote for bricks.${affiliate ? `\n\nRef: ${affiliate.code}` : ""}`);

  if (affiliate && PREVIEW_BOTS.test(ua)) return previewPage(url.origin, `/w/${affiliate.code}`, affiliate.code, affiliate.name.split(" ")[0], dest);

  if (affiliate) {
    try {
      const device = /mobile|android|iphone/i.test(ua) ? "mobile" : "desktop";
      const city = req.headers.get("x-vercel-ip-city");
      await recordClick(affiliate.id, "/whatsapp", device, city ? decodeURIComponent(city) : null);
      await recordLead(affiliate.code, "whatsapp_link", "Opened a WhatsApp chat with Victors from your WhatsApp link");
    } catch (e) {
      console.error("[tora-mari] WhatsApp link not recorded", e);
    }
  }
  return Response.redirect(dest, 302);
}
