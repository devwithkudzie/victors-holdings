import { BusinessJsonLd } from "@/components/BusinessJsonLd";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { productImage } from "@/lib/images";
import { products } from "@/lib/products";
import { resolveImage } from "@/lib/resolve-image";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const menuProducts = products.map((p) => ({ slug: p.slug, name: p.name, img: resolveImage(productImage(p.slug)) }));

  return (
    <>
      <BusinessJsonLd />
      <Header products={menuProducts} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
