import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import { site } from "@/lib/site";
import { deliveredTo } from "@/lib/testimonials";

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** "Victors at a glance": mixed-size tiles for products, delivery, the yard and help estimating. */
export function Bento() {
  const bricks = getProduct("red-common-bricks");
  return (
    <section className="section bento-section">
      <div className="sectionhead">
        <div>
          <h2 className="section-title">Victors at a glance</h2>
        </div>
      </div>

      <div className="bento">
        <Link href="/products/red-common-bricks" className="bt bt-photo bt-bricks">
          <Image src="/images/blue-heart-common/blueheart5.jpg" alt="Stacks of red common bricks at the Victors yard" fill sizes="(max-width: 899px) 100vw, 50vw" />
          <span className="bt-content">
            <small>{bricks?.variants.length} types</small>
            <b>Red Common Bricks</b>
            <span>Blue Heart · Smooth · First Grade · Load Bearing · Farm</span>
            <em>
              View bricks <Arrow />
            </em>
          </span>
        </Link>

        <div className="bt bt-green bt-delivery">
          <small>Delivery</small>
          <b>Nationwide delivery across Zimbabwe</b>
          <div className="bt-chips">
            {deliveredTo.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
        </div>

        <div className="bt bt-yard">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden>
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <small>Our yard</small>
          <b>{site.address.locality}</b>
          <span>Harare&apos;s growing construction hub</span>
        </div>

        <Link href="/products/face-bricks" className="bt bt-photo bt-face">
          <Image src="/images/product-face-bricks-2.jpg" alt="Face bricks" fill sizes="(max-width: 899px) 50vw, 25vw" />
          <span className="bt-content">
            <b>Face Bricks</b>
            <em>
              10 finishes <Arrow />
            </em>
          </span>
        </Link>

        <Link href="/products/pavers" className="bt bt-photo bt-paving">
          <Image src="/images/product-pavers-1.jpg" alt="Interlocking pavers" fill sizes="(max-width: 899px) 100vw, 50vw" />
          <span className="bt-content">
            <small>Supply &amp; install</small>
            <b>Paving, done for you</b>
            <span>Interlocking, Holland and half-brick paving</span>
            <em>
              See paving <Arrow />
            </em>
          </span>
        </Link>

        <Link href="/brick-calculator" className="bt bt-gold bt-estimate">
          <small>Not sure how many bricks?</small>
          <b>Upload your plan — get your bricks &amp; a quote.</b>
          <span className="bt-btn">Free brick calculator →</span>
        </Link>
      </div>
    </section>
  );
}
