import type { Metadata } from "next";
import Image from "next/image";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Photo } from "@/components/Photo";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { images, productGallery } from "@/lib/images";

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
// Opening line tells Victors this WhatsApp lead came from the campaign
const INTRO = "Hi Victors, I saw your Red Common Bricks ad and I'd like a quote.";

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

  return (
    <>
      <section className="hero campaign-hero">
        <div>
          <div className="eyebrow">Red Common Bricks</div>
          <h1>Red Common Bricks Available in Harare</h1>
          <p className="lead-strong">Building? Start with the right bricks.</p>
          <p>Quality bricks for residential, commercial and construction projects — delivered to your site.</p>
          <div className="actions">
            <WhatsAppButton message={INTRO} source={SOURCE} />
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
            <WhatsAppButton
              key={q}
              message={`${INTRO}\n\nQuantity: ${q} bricks\nSite location: `}
              source={SOURCE}
              className="qty"
            >
              <strong>{q}</strong>
              <span>bricks →</span>
            </WhatsAppButton>
          ))}
          <WhatsAppButton
            message={`${INTRO}\n\nI'm not sure how many bricks I need — can you help me estimate?`}
            source={SOURCE}
            className="qty qty-alt"
          >
            <strong>Not sure?</strong>
            <span>Help me estimate →</span>
          </WhatsAppButton>
        </div>
      </section>

      <section className="section">
        <div className="split">
          <div>
            <div className="eyebrow">Delivery</div>
            <h2>Delivered where you&apos;re building.</h2>
            <p className="muted">
              Victors arranges delivery to sites in and around Harare. Share your location when you enquire and
              we&apos;ll confirm delivery options and timing with your quote.
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

      <section className="section enquire-section" id="quote">
        <div className="enquire-grid">
          <div>
            <div className="eyebrow">Get a quote</div>
            <h2>Need bricks for your project?</h2>
            <p className="muted">Tell us how many you need and where you&apos;re building.</p>
          </div>
          <EnquiryForm
            source={SOURCE}
            defaultProduct="Red Common Bricks"
            intro={INTRO}
            quantityLabel="How many bricks?"
            submitLabel="Get a Quote on WhatsApp →"
          />
        </div>
      </section>

      <div className="sticky-wa">
        <WhatsAppButton message={INTRO} source={SOURCE} />
      </div>
    </>
  );
}
