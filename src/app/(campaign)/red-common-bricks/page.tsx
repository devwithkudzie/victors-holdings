import type { Metadata } from "next";
import Image from "next/image";
import { Photo } from "@/components/Photo";
import { Testimonials } from "@/components/Testimonials";
import { VariantList } from "@/components/VariantList";
import { LeadForm, QuoteButton } from "@/components/QuoteSheet";
import { NOT_SURE } from "@/lib/lead";
import { images, productGallery } from "@/lib/images";
import { getProduct } from "@/lib/products";

/**
 * CAMPAIGN LANDING PAGE — the destination for Facebook/Instagram/WhatsApp ads.
 * Evergreen/search traffic goes to /products/red-common-bricks instead, so this
 * page is noindexed and can be changed freely between campaigns.
 */
export const metadata: Metadata = {
  title: "Red Common Bricks Available in Harare",
  description: "Quality red common bricks for residential, commercial and construction projects. Get a quote on WhatsApp.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/products/red-common-bricks" },
};

const SOURCE = "campaign_red_common_bricks";
const REF = "Bricks ad";

const benefits = [
  { title: "Built for real projects", body: "Dependable bricks for foundations, walls and everyday construction." },
  { title: "Supply at your scale", body: "From a single house to a multi-unit development." },
  { title: "Delivered to your site", body: "Tell us where you're building and we'll arrange delivery." },
  { title: "Quick answers", body: "Message us on WhatsApp and get a response without chasing." },
];

const quantities = ["Under 5,000", "5,000 – 20,000", "20,000 – 50,000", "50,000+"];

const audiences = [
  { title: "Homeowners", body: "Building a new home, extension or boundary wall." },
  { title: "Contractors", body: "Reliable supply to keep your crew laying, not waiting." },
  { title: "Developers", body: "Bulk supply scheduled across multi-unit projects." },
];

export default function RedCommonBricksCampaign() {
  const photos = productGallery("red-common-bricks");
  const bricks = getProduct("red-common-bricks")!;

  return (
    <>
      <section className="hero campaign-hero">
        <div>
          <div className="eyebrow">Red Common Bricks</div>
          <h1>Red Common Bricks Available in Harare</h1>
          <p className="lead-strong">Building? Start with the right bricks.</p>
          <p>Quality bricks for residential, commercial and construction projects — delivered to your site.</p>
          <div className="actions">
            <QuoteButton category="red-common-bricks" source={SOURCE} leadRef={REF} />
            <a className="secondary" href="#quote">
              Request a quote
            </a>
          </div>
        </div>
        <div className="brickwall">
          <Photo name={images.campaignHero} alt="Pallets of red common bricks" fallback="brick" className="bricks" priority />
          <div className="brick-overlay" />
          <div className="hero-card">
            <b>Ready for your build</b>
            <span>Tell us your quantity and location for a quote.</span>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="benefit-row">
          {benefits.map((b) => (
            <div key={b.title}>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {photos.length > 1 && (
        <section className="section section-tight">
          <div className="photo-strip">
            {photos.map((src, i) => (
              <div className="photo" key={src}>
                <Image src={src} alt={`Red common bricks — photo ${i + 1}`} fill sizes="(max-width: 800px) 50vw, 20vw" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section section-tight">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">Our bricks</div>
            <h2>Pick your brick.</h2>
          </div>
          <p>Tap Ask to get a quote for a specific brick on WhatsApp.</p>
        </div>
        <VariantList product={bricks} source={SOURCE} leadRef={REF} />
      </section>

      <section className="section dark">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">Quantities</div>
            <h2>How many bricks do you need?</h2>
          </div>
          <p>Tap your quantity to start a WhatsApp quote. Not sure yet? Send us your plan and we&apos;ll help estimate.</p>
        </div>
        <div className="qty-grid">
          {quantities.map((q) => (
            <QuoteButton
              key={q}
              category="red-common-bricks"
              quantity={`${q} bricks`}
              source={SOURCE}
              leadRef={REF}
              className="qty"
              label={
                <>
                  <strong>{q}</strong>
                  <span>bricks →</span>
                </>
              }
            />
          ))}
          <QuoteButton
            category="red-common-bricks"
            quantity={NOT_SURE}
            source={SOURCE}
            leadRef={REF}
            className="qty qty-alt"
            label={
              <>
                <strong>Not sure?</strong>
                <span>Help me estimate →</span>
              </>
            }
          />
        </div>
      </section>

      <section className="section">
        <div className="split">
          <div>
            <div className="eyebrow">Delivery</div>
            <h2>Delivered where you&apos;re building.</h2>
            <p className="muted">
              We deliver from our Mt Hampden yard to sites across Harare and surrounding areas, and customers have
              had bricks delivered as far as Kadoma and Mt Darwin. Share your location when you enquire and we&apos;ll
              confirm delivery cost and timing with your quote.
            </p>
          </div>
          <div>
            <div className="eyebrow">Who it&apos;s for</div>
            <div className="audiences">
              {audiences.map((a) => (
                <div key={a.title}>
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Testimonials eyebrow="Customers on WhatsApp" title="Bricks delivered. Customers happy." />

      <section className="section enquire-section" id="quote">
        <div className="enquire-grid">
          <div>
            <div className="eyebrow">Get a quote</div>
            <h2>Need bricks for your project?</h2>
          </div>
          <div className="lead-card">
            <LeadForm inline category="red-common-bricks" source={SOURCE} leadRef={REF} />
          </div>
        </div>
      </section>

      <div className="sticky-wa">
        <QuoteButton category="red-common-bricks" source={SOURCE} leadRef={REF} />
      </div>
    </>
  );
}
