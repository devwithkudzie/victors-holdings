import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { Gallery } from "@/components/Gallery";
import { Photo } from "@/components/Photo";
import { Testimonials } from "@/components/Testimonials";
import { VariantList } from "@/components/VariantList";
import { LeadForm, QuoteButton } from "@/components/QuoteSheet";
import { productGallery, productImage } from "@/lib/images";
import { getProduct, products } from "@/lib/products";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} in Harare`,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const photos = productGallery(product.slug);
  const others = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const source = `product_${product.slug.replace(/-/g, "_")}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Organization", name: site.name },
    url: `${site.url}/products/${product.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/products">Products</Link> / <span>{product.name}</span>
      </nav>

      <section className="product-hero">
        <div>
          <div className="eyebrow">{product.tag}</div>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="actions">
            <QuoteButton category={product.slug} source={source} />
            <a className="secondary" href="#enquire">
              Request a quote
            </a>
          </div>
        </div>
        {photos.length > 0 ? (
          <Gallery photos={photos} alt={product.name} />
        ) : (
          <Photo
            name={productImage(product.slug)}
            alt={product.name}
            fallback={product.swatch}
            className="product-visual"
          />
        )}
      </section>

      <section className="section section-tight" id="types">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">{product.variants.length > 1 ? `${product.variants.length} options` : "Available"}</div>
            <h2>{product.variants.length > 1 ? `Choose your ${product.name.toLowerCase()}` : product.name}</h2>
          </div>
        </div>
        <VariantList product={product} source={source} />
      </section>

      <section className="section section-tight">
        <div className="detail-grid">
          <div>
            <h2 className="h3">Ideal for</h2>
            <ul className="checklist">
              {product.uses.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
          <div className="highlights">
            {product.highlights.map((h) => (
              <div key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {product.steps && (
        <section className="section">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">How we work</div>
              <h2>A finished surface starts underneath.</h2>
            </div>
          </div>
          <div className="process">
            {product.steps.map((s, i) => (
              <div className="step" key={s.title}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {product.slug.endsWith("bricks") && <Testimonials />}

      <section className="section enquire-section" id="enquire">
        <div className="enquire-grid">
          <div>
            <div className="eyebrow">{product.name}</div>
            <h2>Get today&apos;s price</h2>
          </div>
          <div className="lead-card">
            <LeadForm inline category={product.slug} source={source} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">More from Victors</div>
            <h2>Other products</h2>
          </div>
        </div>
        <div className="products">
          {others.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
