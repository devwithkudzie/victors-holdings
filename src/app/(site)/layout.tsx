import { Footer } from "@/components/Footer";
import { HeaderApp } from "@/components/headers/HeaderApp";
import { HeaderBold } from "@/components/headers/HeaderBold";
import { HeaderPremium } from "@/components/headers/HeaderPremium";
import { productImage } from "@/lib/images";
import { products } from "@/lib/products";
import { resolveImage } from "@/lib/resolve-image";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const menuProducts = products.map((p) => ({ slug: p.slug, name: p.name, img: resolveImage(productImage(p.slug)) }));

  // All three navbars are rendered; CSS shows the one matching <html data-design>.
  return (
    <>
      <div className="only-a"><HeaderBold products={menuProducts} /></div>
      <div className="only-b"><HeaderApp products={menuProducts} /></div>
      <div className="only-c"><HeaderPremium products={menuProducts} /></div>
      <main>{children}</main>
      <Footer />
    </>
  );
}
