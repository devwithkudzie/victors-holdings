import { NextResponse } from "next/server";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { findAffiliateByCode, recordClick, REF_COOKIE } from "@/lib/server/affiliates";

const PREVIEW_BOTS = /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|skypeuripreview|googlebot|bingbot/i;

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Minimal page for link previews: title, description and the affiliate's flyer image */
function previewPage(origin: string, code: string, first: string, dest: string) {
  const title = esc(`Quality bricks, delivered nationwide — recommended by ${first}`);
  const desc = esc(`Get a quote from Victors Holdings on WhatsApp. Use code ${code}. Pay on delivery.`);
  const img = esc(`${origin}/api/flyer/${code}?size=og`);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(`${origin}/r/${code}`)}"><meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${esc(dest)}"></head><body></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

/**
 * Referral link: /r/TENDAI20 (optionally ?to=/products/face-bricks)
 * Records the click, remembers the code on this phone for 60 days, then opens the site.
 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const dest = new URL(to && to.startsWith("/") && !to.startsWith("//") ? to : "/", url.origin);
  // WhatsApp, Facebook etc. fetch the link to build a preview: show the affiliate's flyer, and don't count it as a click
  const ua = req.headers.get("user-agent") ?? "";
  if (PREVIEW_BOTS.test(ua)) {
    const affiliate = await findAffiliateByCode(code).catch(() => null);
    if (affiliate) return previewPage(url.origin, affiliate.code, affiliate.name.split(" ")[0], dest.toString());
  }

  const res = NextResponse.redirect(dest);

  try {
    const affiliate = await findAffiliateByCode(code);
    if (affiliate) {
      const device = /mobile|android|iphone/i.test(ua) ? "mobile" : "desktop";
      const city = req.headers.get("x-vercel-ip-city");
      await recordClick(affiliate.id, dest.pathname, device, city ? decodeURIComponent(city) : null);
      // Most recent referral wins (rules): overwrite any earlier code
      res.cookies.set(REF_COOKIE, affiliate.code, { maxAge: PROGRAMME.linkDays * 86400, path: "/", sameSite: "lax" });
    }
  } catch (e) {
    console.error("[tora-mari] click not recorded", e);
  }
  return res;
}
