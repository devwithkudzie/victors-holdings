import { NextResponse } from "next/server";
import { PROGRAMME } from "@/lib/affiliate-rules";
import { findAffiliateByCode, recordClick, REF_COOKIE } from "@/lib/server/affiliates";
import { PREVIEW_BOTS, previewPage } from "@/lib/server/link-preview";

/**
 * Referral link: /r/TENDAI20 (optionally ?to=/products/face-bricks)
 * Records the click, remembers the code on this phone for 60 days, then opens the quote form.
 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  // Referral visitors land on the quote / order form (or a specific page with ?to=/products/…)
  const dest = new URL(to && to.startsWith("/") && !to.startsWith("//") ? to : "/quote", url.origin);
  // WhatsApp, Facebook etc. fetch the link to build a preview: show the affiliate's flyer, and don't count it as a click
  const ua = req.headers.get("user-agent") ?? "";
  if (PREVIEW_BOTS.test(ua)) {
    const affiliate = await findAffiliateByCode(code).catch(() => null);
    if (affiliate) return previewPage(url.origin, `/r/${affiliate.code}`, affiliate.code, affiliate.name.split(" ")[0], dest.toString());
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
