import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Red common and face bricks, pavers, river and pit sand, quarry stones, cement and roofing from Victors Holdings, Mt Hampden, Harare.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <section className="page-head">
        <div className="eyebrow">Catalogue</div>
        <h1>All products</h1>
        <p>
          Building materials for residential, commercial and construction projects. Choose a product to see details
          and request a quote.
        </p>
      </section>
      <section className="section section-tight">
        <div className="products">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
      <CtaBand
        title="Can't see what you need?"
        body="Send us your material list and we'll let you know what we can supply."
        category="cement-and-roofing"
        source="catalogue_cta"
      />
    </>
  );
}
