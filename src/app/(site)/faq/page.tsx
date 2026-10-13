import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { faqs } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Delivery, ordering, minimum orders and prices at Victors Holdings, building materials supplier in Mt Hampden, Harare.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-head">
        <div className="eyebrow">FAQ</div>
        <h1>Questions, answered.</h1>
      </section>
      <section className="section section-tight">
        <div className="faq">
          {faqs.map((f, i) => (
            <details key={f.q} className="faq-item" open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <p className="faq-more">
          Still have a question? <Link href="/contact">Contact us</Link>.
        </p>
      </section>
      <CtaBand source="faq_cta" />
    </>
  );
}
