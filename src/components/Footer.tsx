import Link from "next/link";
import { products } from "@/lib/products";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Logo light />
          <p>{site.tagline}</p>
          <p>{site.location} · Nationwide delivery · Pay on delivery</p>
        </div>
        <div>
          <b>Products</b>
          {products.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`}>
              {p.name}
            </Link>
          ))}
        </div>
        <div>
          <b>Company</b>
          <Link href="/about">About</Link>
          <Link href="/brick-calculator">Brick calculator</Link>
          <Link href="/tora-mari">Tora Mari — refer &amp; earn</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/products">All products</Link>
        </div>
      </div>
      <div className="footer-base">
        © {new Date().getFullYear()} Victors Holdings · <Link href="/credits">Photo credits</Link>
      </div>
    </footer>
  );
}
