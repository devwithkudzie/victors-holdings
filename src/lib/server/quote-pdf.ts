import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { formatZimMobile } from "../phone";
import { site } from "../site";
import { money, type Quote } from "./quote";

const GREEN = rgb(14 / 255, 77 / 255, 46 / 255);
const GOLD = rgb(245 / 255, 184 / 255, 0);
const INK = rgb(0.08, 0.09, 0.1);
const MUTED = rgb(0.4, 0.43, 0.42);
const LINE = rgb(0.88, 0.9, 0.89);

/** Standard PDF fonts only cover basic Latin — swap characters they can't draw */
const safe = (s: string) =>
  s.replace(/[≈~]/g, "about ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\x20-\x7E -ÿ—–•…]/g, "");

export async function renderQuotePdf(q: Quote): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Quotation ${q.number} — ${site.name}`);
  pdf.setAuthor(site.name);
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width } = page.getSize();
  const M = 48;
  let y = 790;

  const text = (s: string, x: number, yy: number, o: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {}) =>
    page.drawText(safe(s), { x, y: yy, size: o.size ?? 10, font: o.f ?? font, color: o.color ?? INK });
  const right = (s: string, xRight: number, yy: number, o: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {}) => {
    const w = (o.f ?? font).widthOfTextAtSize(safe(s), o.size ?? 10);
    text(s, xRight - w, yy, o);
  };

  // Header: logo + QUOTATION
  try {
    const png = fs.readFileSync(path.join(process.cwd(), "public/images/logo-horizontal.png"));
    const logo = await pdf.embedPng(png);
    const h = 30;
    page.drawImage(logo, { x: M, y: y - 6, width: (logo.width / logo.height) * h, height: h });
  } catch {
    text(site.name.toUpperCase(), M, y + 4, { size: 16, f: bold });
  }
  right("QUOTATION", width - M, y + 8, { size: 20, f: bold, color: GREEN });
  right(`No. ${q.number}`, width - M, y - 8, { color: MUTED });
  y -= 30;
  page.drawRectangle({ x: M, y, width: width - 2 * M, height: 3, color: GOLD });
  y -= 26;

  // Supplier / customer / dates
  text("FROM", M, y, { size: 8, f: bold, color: MUTED });
  text("TO", M + 190, y, { size: 8, f: bold, color: MUTED });
  text("DATES", M + 370, y, { size: 8, f: bold, color: MUTED });
  y -= 14;
  const col = (lines: string[], x: number) => lines.forEach((l, i) => text(l, x, y - i * 13, { f: i === 0 ? bold : font }));
  col([site.name, site.location + ", Zimbabwe", `WhatsApp ${formatZimMobile(site.whatsapp)}`, site.url.replace(/^https?:\/\//, "")], M);
  col([q.customer.name, formatZimMobile(q.customer.phone), q.customer.type], M + 190);
  col([`Issued: ${q.date}`, `Valid until: ${q.validUntil}`], M + 370);
  y -= 70;

  // Line items table
  const cols = { item: M + 10, qty: 360, price: 450, amount: width - M - 10 };
  page.drawRectangle({ x: M, y: y - 6, width: width - 2 * M, height: 22, color: GREEN });
  text("ITEM", cols.item, y, { size: 9, f: bold, color: rgb(1, 1, 1) });
  right("QUANTITY", cols.qty, y, { size: 9, f: bold, color: rgb(1, 1, 1) });
  right("PER 1,000", cols.price, y, { size: 9, f: bold, color: rgb(1, 1, 1) });
  right("AMOUNT", cols.amount, y, { size: 9, f: bold, color: rgb(1, 1, 1) });
  y -= 28;
  text(q.product, cols.item, y, { f: bold });
  right(q.quantity.toLocaleString("en-US"), cols.qty, y);
  right(money(q, q.pricePerThousand), cols.price, y);
  right(money(q, q.total), cols.amount, y, { f: bold });
  y -= 14;
  if (q.minimumOrderApplied) {
    text(`Minimum order for this brick is ${q.quantity.toLocaleString("en-US")} (your estimate: ${q.estimate.total.toLocaleString("en-US")}).`, cols.item, y, { size: 8.5, color: MUTED });
    y -= 12;
  }
  text("Delivery: cost confirmed by Victors based on your site location.", cols.item, y, { size: 8.5, color: MUTED });
  y -= 10;
  hr(page, M, y, width);
  y -= 22;
  right("TOTAL (bricks, excl. delivery)", cols.price, y, { size: 10, f: bold });
  right(money(q, q.total), cols.amount, y, { size: 13, f: bold, color: GREEN });
  y -= 36;

  // Brick estimate breakdown
  text("HOW WE WORKED OUT YOUR BRICKS", M, y, { size: 9, f: bold, color: GREEN });
  y -= 16;
  for (const l of q.estimate.lines) {
    text(l.label, M + 10, y, { size: 9 });
    right(`${l.area.toFixed(1)} m²  ×  ${l.skins === 2 ? "2 layers" : "1 layer"}`, 430, y, { size: 9, color: MUTED });
    right(l.bricks.toLocaleString("en-US"), width - M - 10, y, { size: 9 });
    y -= 14;
  }
  text("Breakages and cutting", M + 10, y, { size: 9 });
  right(q.estimate.wastage.toLocaleString("en-US"), width - M - 10, y, { size: 9 });
  y -= 8;
  hr(page, M, y, width);
  y -= 16;
  text(`Estimated bricks needed: ${q.estimate.total.toLocaleString("en-US")}`, M + 10, y, { f: bold });
  right(`likely range ${q.estimate.range[0].toLocaleString("en-US")} – ${q.estimate.range[1].toLocaleString("en-US")}`, width - M - 10, y, { size: 9, color: MUTED });
  y -= 28;

  // Assumptions
  text("ASSUMPTIONS", M, y, { size: 9, f: bold, color: GREEN });
  y -= 14;
  for (const a of q.estimate.assumptions.slice(0, 9)) {
    for (const line of wrap(`• ${a}`, font, 8.5, width - 2 * M - 20)) {
      text(line, M + 10, y, { size: 8.5, color: MUTED });
      y -= 11;
    }
    if (y < 120) break;
  }

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 92, color: rgb(0.96, 0.97, 0.96) });
  const foot = [
    "This is an estimate based on the plan or house size you provided. Victors Holdings will confirm the final quantity, price and",
    `delivery cost before you order. Prices valid until ${q.validUntil}. Prices are in US dollars.`,
  ];
  foot.forEach((l, i) => text(l, M, 62 - i * 12, { size: 8, color: MUTED }));
  text(`Order or ask a question on WhatsApp: ${formatZimMobile(site.whatsapp)}`, M, 30, { size: 9, f: bold, color: GREEN });

  return pdf.save();
}

function hr(page: PDFPage, x: number, y: number, width: number) {
  page.drawLine({ start: { x, y }, end: { x: width - x, y }, thickness: 0.7, color: LINE });
}

function wrap(s: string, font: PDFFont, size: number, max: number) {
  const words = safe(s).split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}
