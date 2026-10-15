import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { LeadForm } from "@/components/QuoteSheet";
import { getProduct } from "@/lib/products";
import { findAffiliateByCode, REF_COOKIE } from "@/lib/server/affiliates";

export const metadata: Metadata = {
  title: "Get a quote or order bricks",
  description: "Request a quote or place an order with Victors Holdings. Nationwide delivery, pay on delivery.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

const POINTS = ["Nationwide delivery", "Pay on delivery", "Reply on WhatsApp, usually the same day"];

/** Where referral links land: a focused quote / order form */
export default async function QuotePage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const code = (await cookies()).get(REF_COOKIE)?.value;
  const affiliate = code ? await findAffiliateByCode(code).catch(() => null) : null;
  const { product } = await searchParams;
  const category = product && getProduct(product) ? product : undefined;

  return (
    <section className="qp">
      <div className="qp-intro">
        {affiliate && (
          <p className="qp-ref">
            <span aria-hidden>👋</span> Recommended by <b>{affiliate.name.split(" ")[0]}</b>
          </p>
        )}
        <h1>Get a quote or order your bricks</h1>
        <p className="qp-lead">Tell us what you need and where you&apos;re building. We&apos;ll reply on WhatsApp with the price and delivery.</p>
        <ul className="qp-points">
          {POINTS.map((p) => (
            <li key={p}>✓ {p}</li>
          ))}
        </ul>
      </div>

      <div className="lead-card qp-form">
        <LeadForm inline category={category} source={affiliate ? "referral_quote_page" : "quote_page"} />
      </div>

      <p className="qp-more">
        Want to look around first? <Link href="/products">See all products and prices →</Link>
      </p>
    </section>
  );
}
