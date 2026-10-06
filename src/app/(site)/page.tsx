import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard } from "@/components/ProductCard";
import { Testimonials } from "@/components/Testimonials";
import { productImage } from "@/lib/images";
import { resolveImage } from "@/lib/resolve-image";
import { products } from "@/lib/products";

const featured = products.slice(0, 3);

const benefits = [
  { title: "Quality materials", body: "Source construction materials with confidence and ask about current availability." },
  { title: "Reliable supply", body: "Tell us what you need, how much you need and when you need it." },
  { title: "Delivery support", body: "Arrange the most practical way to get your materials where the project needs them." },
];

const delivery = [
  { title: "Tell us what you need", body: "Product, quantity and where you're building — on WhatsApp or through our form." },
  { title: "Get your quote", body: "We confirm availability, pricing and delivery options." },
  { title: "Confirm your order", body: "Agree on a delivery date that fits your build schedule." },
  { title: "Delivered to site", body: "Materials arrive where your project needs them." },
];

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      <nav className="rail" aria-label="Browse products">
        {products.map((p) => {
          const img = resolveImage(productImage(p.slug));
          return (
            <Link key={p.slug} href={`/products/${p.slug}`} className="rail-item">
              <span className="rail-img">{img && <Image src={img} alt="" fill sizes="96px" />}</span>
              {p.name}
            </Link>
          );
        })}
      </nav>

      <section className="section">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">What we supply</div>
            <h2>Materials for the job.</h2>
          </div>
          <p>
            Whether you&apos;re building a home, developing property or managing a construction project, Victors
            helps you source the materials you need.
          </p>
        </div>
        <div className="products">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="section-link">
          <Link href="/products">See all products →</Link>
        </div>
      </section>

      <section className="section dark">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">Why Victors</div>
            <h2>
              Less chasing.
              <br />
              More building.
            </h2>
          </div>
          <p>
            Clear information, fast enquiries and a straightforward path from requirement to delivery.
          </p>
        </div>
        <div className="benefits">
          {benefits.map((b, i) => (
            <div className="benefit" key={b.title}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />

      <section className="section">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">Delivery</div>
            <h2>From enquiry to site.</h2>
          </div>
          <p>Ordering from Victors is simple. Here&apos;s how it works.</p>
        </div>
        <div className="process">
          {delivery.map((s, i) => (
            <div className="step" key={s.title}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section about-teaser">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">About Victors</div>
            <h2>A Mt Hampden supplier built around the builder.</h2>
          </div>
          <div>
            <p>
              From our yard in Mt Hampden, one of Harare&apos;s fastest-growing construction hubs, Victors supplies
              builders, contractors, developers and homeowners across Harare and surrounding areas.
            </p>
            <Link className="text-link" href="/about">
              More about us →
            </Link>
          </div>
        </div>
      </section>

      <CtaBand source="home_cta" />
    </>
  );
}
