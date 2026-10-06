import Image from "next/image";
import Link from "next/link";
import { productImage } from "@/lib/images";
import { products } from "@/lib/products";
import { resolveImage } from "@/lib/resolve-image";

/** "Browse our range" callout under the homepage hero: one card per product category. */
export function RangeCallout() {
  return (
    <section className="range" aria-labelledby="range-title">
      <div className="range-panel">
        <div className="range-head">
          <div>
            <span className="range-kicker">Our range</span>
            <h2 id="range-title">Everything for your build</h2>
          </div>
          <Link href="/products" className="range-all">
            See all products
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="range-track">
          {products.map((p) => {
            const img = resolveImage(productImage(p.slug));
            return (
              <Link key={p.slug} href={`/products/${p.slug}`} className="range-card">
                <span className={`range-img${img ? "" : " is-empty"}`}>
                  {img ? (
                    <Image src={img} alt="" fill sizes="(max-width: 899px) 150px, 190px" />
                  ) : (
                    /* No photo yet (e.g. Cement & Roofing) — neutral tile with a simple materials icon */
                    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden>
                      <path
                        d="M4 20V9l8-5 8 5v11M9 20v-6h6v6M3 20h18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="range-body">
                  <b>{p.name}</b>
                  <small>
                    {p.variants.length} {p.variants.length === 1 ? "type" : "types"}
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </small>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
