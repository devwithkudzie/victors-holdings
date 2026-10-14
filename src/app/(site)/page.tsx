import Link from "next/link";
import { BenefitBar } from "@/components/BenefitBar";
import { Bento } from "@/components/Bento";
import { CtaBand } from "@/components/CtaBand";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeFaq } from "@/components/HomeFaq";
import { ProductTile } from "@/components/ProductTile";
import { RangeCallout } from "@/components/RangeCallout";
import { ShopByType } from "@/components/ShopByType";
import { Testimonials } from "@/components/Testimonials";
import { heroSlides } from "@/lib/hero-slides";
import { brickTypes, shopItems } from "@/lib/shop";

// Homepage layout modelled on leading online brick merchants:
// selling-points strip → hero → mega brick deals → brick collections (by type) → all materials → tools → proof → about → FAQ
export default function HomePage() {
  const items = shopItems();
  const deals = items.filter((i) => i.save);

  return (
    <>
      <BenefitBar />
      <HeroCarousel slides={heroSlides()} />

      {deals.length > 0 && (
        <section className="section deals" aria-labelledby="deals-title">
          <div className="sectionhead">
            <div>
              <h2 id="deals-title" className="section-title">Mega brick deals</h2>
            </div>
            <p>Every brick with a lower price in our catalogue right now — while stocks last.</p>
          </div>
          <div className="deals-track">
            {deals.map((item) => (
              <ProductTile key={item.key} item={item} source="home_deals" />
            ))}
          </div>
        </section>
      )}

      <ShopByType items={items} types={brickTypes} />

      <RangeCallout flat />

      <Bento />

      <Testimonials />

      <section className="section about-teaser">
        <div className="sectionhead">
          <div>
            <h2 className="section-title">About Victors</h2>
          </div>
          <div>
            <p>
              From our yard in Mt Hampden, one of Harare&apos;s fastest-growing construction hubs, Victors supplies
              builders, contractors, developers and homeowners nationwide.
            </p>
            <Link className="text-link" href="/about">
              More about us →
            </Link>
          </div>
        </div>
      </section>

      <HomeFaq />

      <CtaBand source="home_cta" />
    </>
  );
}
