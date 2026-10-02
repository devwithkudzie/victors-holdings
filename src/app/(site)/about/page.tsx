import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { Photo } from "@/components/Photo";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "About",
  description: "Trusted building materials supplier in Mt Hampden, Harare. Bricks, cement, quarry stones, river and pit sand, aggregates and roofing for residential, commercial and industrial projects, delivered across Harare and surrounding areas.",
  alternates: { canonical: "/about" },
};

// TODO: replace with Victors' own story (founding year, yard location, fleet, notable projects)
const values = [
  { title: "Quality materials", body: "Materials you can build with confidently." },
  { title: "Reliable supply", body: "Clear availability and dependable delivery dates." },
  { title: "Straight answers", body: "Fast responses on WhatsApp — no chasing." },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-head">
        <div className="eyebrow">About Victors</div>
        <h1>Less chasing. More building.</h1>
        <p>
          Victors Holdings is a trusted building materials supplier based in Mt Hampden, Harare, supplying
          residential, commercial and industrial projects.
        </p>
      </section>
      <div className="about-photo-wrap">
        <Photo name={images.about} alt="House under construction with brick walls" fallback="brick" className="about-photo" sizes="100vw" />
      </div>
      <section className="section section-tight">
        <div className="prose">
          <p>
            We know that on a build, waiting on materials costs time and money. That&apos;s why we focus on what
            builders actually need: clear information, fast enquiries and a straightforward path from requirement
            to delivery.
          </p>
          <p>
            We supply a wide range of building products: red common and face bricks, cement, quarry stones, river
            sand, pit sand, aggregates, roofing materials, pavers and other construction essentials, at competitive
            prices.
          </p>
          <p>
            Our commitment is reliable products, excellent customer service and timely supply to builders,
            contractors, developers and homeowners across Harare and surrounding areas. Mt Hampden is a growing
            construction hub, and we&apos;re proud to be the local supplier helping new developments get built.
          </p>
        </div>
        <div className="benefits light">
          {values.map((v, i) => (
            <div className="benefit" key={v.title}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </section>
      <CtaBand source="about_cta" />
    </>
  );
}
