import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { findAffiliateByCode } from "@/lib/server/affiliates";
import { site } from "@/lib/site";
import { flyerDeals, flyerLineup, flyerFonts, publicDataUri } from "@/lib/server/flyer-data";

const SIZES = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  og: { width: 1200, height: 630 },
} as const;

const GREEN = "#0e4d2e";
const GOLD = "#f5b800";
const RED = "#c8281c";

/**
 * Personalised Tora Mari flyer: GET /api/flyer/TENDAI28?size=square|story|og
 * Square/tall: logo, the featured brick large (photo, price, discount) with other products listed beside it
 * (thumbnail, name, price), "Recommended by …", the affiliate's code and a QR code.
 * og: link-preview version (WhatsApp/Facebook).
 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const affiliate = await findAffiliateByCode(code);
  if (!affiliate) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const size = (url.searchParams.get("size") as keyof typeof SIZES) in SIZES ? (url.searchParams.get("size") as keyof typeof SIZES) : "square";
  const { width, height } = SIZES[size];
  const link = `${url.origin}/r/${affiliate.code}`;
  const shortLink = link.replace(/^https?:\/\/(www\.)?/, "");
  const qr = await QRCode.toDataURL(link, { margin: 1, width: 420, color: { dark: "#0b2a1a", light: "#ffffff" } });
  const deals = flyerDeals();
  const first = affiliate.name.split(" ")[0];
  const photo = publicDataUri("images/hero/blue-heart-mobile.jpg"); // link-preview image
  const logo = publicDataUri("images/logo-horizontal.png");
  const fonts = await flyerFonts();
  const tall = size === "story";
  const wide = size === "og";

  const font = fonts.length ? "Jakarta" : undefined;
  const opts = { width, height, fonts: fonts.length ? fonts : undefined, headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } };

  // Link preview (WhatsApp / Facebook): dark panel with the code and QR, brick photo on the right
  if (wide) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width, height, fontFamily: font, background: GREEN }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700, height, padding: 48, background: GREEN }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignSelf: "flex-start", background: "#fff", padding: "10px 16px" }}>
                <img src={logo} height={38} width={(38 * 1010) / 192} alt="" />
              </div>
              <span style={{ fontSize: 54, fontWeight: 800, color: "#fff", lineHeight: 1.02 }}>Quality bricks, delivered nationwide</span>
              <span style={{ fontSize: 24, color: GOLD, fontWeight: 600 }}>
                {deals[0] ? `${deals[0].name} now ${deals[0].now} ${deals[0].unit}` : "Pay on delivery · Wholesale prices"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", padding: 18 }}>
              <img src={qr} width={150} height={150} alt="" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 22, color: "#5f6b66" }}>Recommended by {first} · use code</span>
                <span style={{ display: "flex", alignSelf: "flex-start", background: GOLD, color: "#0b2a1a", fontSize: 50, fontWeight: 800, padding: "2px 14px" }}>
                  {affiliate.code}
                </span>
              </div>
            </div>
          </div>
          <img src={photo} width={500} height={height} style={{ objectFit: "cover" }} alt="" />
        </div>
      ),
      opts,
    );
  }

  // Square & tall flyers: logo, featured brick + product list, code + QR
  const { feature, others } = flyerLineup();
  const pad = tall ? 56 : 40;
  const inner = width - pad * 2;
  const qrSize = tall ? 240 : 168;
  // Square: feature on the left, list on the right. Tall: feature on top, list below.
  const featureW = tall ? inner : 520;
  const featureH = tall ? 600 : 594; // square: same height as the list beside it
  const siteHost = site.url.replace(/^https?:\/\/(www\.)?/, "");
  const listW = tall ? inner : inner - featureW - 18;
  const rowH = tall ? 94 : 97;
  const thumb = rowH - (tall ? 16 : 20);

  const featurePanel = feature && (
    <div style={{ display: "flex", position: "relative", width: featureW, height: featureH, background: "#c96b4a" }}>
      {feature.img && <img src={feature.img} width={featureW} height={featureH} style={{ objectFit: "cover" }} alt="" />}
      {feature.save && (
        <span style={{ position: "absolute", top: 16, left: 16, display: "flex", background: RED, color: "#fff", fontSize: tall ? 40 : 32, fontWeight: 800, padding: "6px 16px" }}>
          {feature.save}
        </span>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", gap: 6, padding: tall ? "26px 28px" : "20px 22px", background: "rgba(255,255,255,0.96)" }}>
        <span style={{ fontSize: tall ? 40 : 30, fontWeight: 800, color: "#14181a", lineHeight: 1.08 }}>{feature.name}</span>
        {feature.price && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: tall ? 78 : 60, fontWeight: 800, color: feature.save ? RED : GREEN, lineHeight: 1 }}>{feature.price}</span>
            <span style={{ fontSize: tall ? 30 : 24, color: "#5f6b66" }}>{feature.unit}</span>
            {feature.was && <span style={{ fontSize: tall ? 30 : 24, color: "#8a918d", textDecoration: "line-through" }}>{feature.was}</span>}
          </div>
        )}
      </div>
    </div>
  );

  const list = (
    <div style={{ display: "flex", flexDirection: "column", gap: tall ? 10 : 10, width: listW }}>
      <span style={{ fontSize: tall ? 26 : 20, fontWeight: 800, color: GOLD, letterSpacing: 1 }}>ALSO AVAILABLE</span>
      {others.map((b) => (
        <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 12, height: rowH, padding: tall ? 8 : 10, background: "#fff" }}>
          {b.img ? (
            <img src={b.img} width={thumb} height={thumb} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ display: "flex", width: thumb, height: thumb, background: "#c96b4a" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
            <span style={{ fontSize: tall ? 27 : 18, fontWeight: 800, color: "#14181a", lineHeight: 1.12 }}>{b.name}</span>
            {b.price && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: tall ? 30 : 21, fontWeight: 800, color: b.save ? RED : GREEN }}>{b.price}</span>
                <span style={{ fontSize: tall ? 20 : 14, color: "#5f6b66" }}>{b.unit}</span>
                {b.was && <span style={{ fontSize: tall ? 20 : 14, color: "#8a918d", textDecoration: "line-through" }}>{b.was}</span>}
              </div>
            )}
          </div>
          {b.save && (
            <span style={{ display: "flex", background: RED, color: "#fff", fontSize: tall ? 20 : 14, fontWeight: 800, padding: "3px 7px" }}>{b.save}</span>
          )}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px" }}>
        <span style={{ fontSize: tall ? 25 : 18, color: "#fff" }}>More products at</span>
        <span style={{ fontSize: tall ? 25 : 18, fontWeight: 800, color: GOLD }}>{siteHost}</span>
      </div>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width, height, padding: pad, gap: tall ? 28 : 16, fontFamily: font, background: GREEN }}>
        {/* Logo, centred */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", background: "#fff", padding: tall ? "18px 32px" : "12px 26px" }}>
            <img src={logo} height={tall ? 64 : 48} width={((tall ? 64 : 48) * 1010) / 192} alt="" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: tall ? 66 : 46, fontWeight: 800, color: "#fff", lineHeight: 1.05, textAlign: "center" }}>Quality bricks, delivered nationwide</span>
          <span style={{ fontSize: tall ? 30 : 24, fontWeight: 600, color: GOLD }}>Pay on delivery · Wholesale prices</span>
        </div>

        {/* Featured brick + other products */}
        <div style={{ display: "flex", flexDirection: tall ? "column" : "row", gap: tall ? 24 : 18, width: inner }}>
          {featurePanel}
          {list}
        </div>

        {/* Code + QR */}
        <div style={{ display: "flex", alignItems: "center", gap: tall ? 30 : 22, background: "#fff", padding: tall ? 28 : 18, marginTop: "auto" }}>
          <img src={qr} width={qrSize} height={qrSize} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            <span style={{ fontSize: tall ? 28 : 22, color: "#5f6b66" }}>Recommended by {first}</span>
            <span style={{ fontSize: tall ? 30 : 23, color: "#14181a", fontWeight: 600 }}>Scan or use my code on WhatsApp</span>
            <span style={{ display: "flex", alignSelf: "flex-start", background: GOLD, color: "#0b2a1a", fontSize: tall ? 68 : 50, fontWeight: 800, padding: "2px 16px" }}>
              {affiliate.code}
            </span>
            <span style={{ fontSize: tall ? 24 : 20, color: GREEN, fontWeight: 600 }}>{shortLink}</span>
          </div>
        </div>
      </div>
    ),
    opts,
  );
}
