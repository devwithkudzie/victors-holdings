import { renderQuotePdf } from "@/lib/server/quote-pdf";
import { verify, type Quote } from "@/lib/server/quote";

/** GET ?t=<signed quote> → the quotation as a downloadable PDF */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const quote = verify<Quote>(token);
  if (!quote?.number) return new Response("This quotation link isn't valid.", { status: 404 });

  const pdf = await renderQuotePdf(quote);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Victors-Holdings-Quotation-${quote.number}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
