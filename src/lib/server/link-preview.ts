import "server-only";

/** Apps that fetch a shared link to build its preview (not real visitors) */
export const PREVIEW_BOTS = /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|skypeuripreview|googlebot|bingbot/i;

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Minimal page for link previews: title, description and the affiliate's flyer image */
export function previewPage(origin: string, path: string, code: string, first: string, dest: string) {
  const title = esc(`Quality bricks, delivered nationwide — recommended by ${first}`);
  const desc = esc(`Get a quote from Victors Holdings on WhatsApp. Use code ${code}. Pay on delivery.`);
  const img = esc(`${origin}/api/flyer/${code}?size=og`);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(`${origin}${path}`)}"><meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${esc(dest)}"></head><body></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
