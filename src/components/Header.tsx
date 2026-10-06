"use client";

import Link from "next/link";
import { nav } from "@/lib/site";
import { useMenu, type MenuProduct } from "@/lib/useMenu";
import { IconArrow, IconChat, IconGrid, IconHome, IconMore, IconQuote } from "./icons";
import { Logo } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";

const WA_MSG = "Hi Victors Holdings 👋";

/**
 * Slim top bar plus an app-style bottom tab bar on phones
 * (always-visible nav in the thumb zone, raised WhatsApp button in the centre).
 * "More" opens a bottom sheet with the rest of the pages and the design picker.
 */
export function Header({ products }: { products: MenuProduct[] }) {
  const { open, toggle, close, pathname } = useMenu();
  const is = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="ha-bar">
        <Logo />
        <nav className="ha-links" aria-label="Main">
          <Link href="/" className={pathname === "/" ? "active" : undefined}>
            Home
          </Link>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={pathname === n.href ? "active" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ha-right">
          <Link href="/contact" className="ha-quote">
            Get a quote
          </Link>
        </div>
      </header>

      <nav className="ha-tabs" aria-label="Tabs">
        <Link href="/" className={is("/") ? "on" : undefined}>
          <IconHome />
          Home
        </Link>
        <Link href="/products" className={is("/products") ? "on" : undefined}>
          <IconGrid />
          Products
        </Link>
        {/* Opens a WhatsApp chat directly — no form */}
        <WhatsAppButton message={WA_MSG} source="tabbar" className="ha-tab-wa">
          <span>
            <IconChat size={24} />
          </span>
          WhatsApp
        </WhatsAppButton>
        <Link href="/contact" className={is("/contact") ? "on" : undefined}>
          <IconQuote />
          Quote
        </Link>
        <button type="button" onClick={toggle} className={open ? "on" : undefined} aria-expanded={open}>
          <IconMore />
          More
        </button>
      </nav>

      <div className={`ha-scrim${open ? " open" : ""}`} onClick={close} aria-hidden />
      <div className={`ha-sheet${open ? " open" : ""}`} aria-hidden={!open}>
        <div className="ha-handle" />
        <div className="ha-sheet-grid">
          {products.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} onClick={close}>
              <span className="ha-thumb" style={p.img ? { backgroundImage: `url(${p.img})` } : undefined} />
              {p.name}
            </Link>
          ))}
        </div>
        <div className="ha-sheet-links">
          <Link href="/about" onClick={close}>
            About Victors <IconArrow size={18} />
          </Link>
          <Link href="/products/pavers" onClick={close}>
            Paving services <IconArrow size={18} />
          </Link>
          <Link href="/contact" onClick={close}>
            Contact & quotes <IconArrow size={18} />
          </Link>
        </div>
      </div>
    </>
  );
}
