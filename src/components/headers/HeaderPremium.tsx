"use client";

import Image from "next/image";
import Link from "next/link";
import { trackWhatsAppClick } from "@/lib/analytics";
import { nav, whatsappLink } from "@/lib/site";
import { useMenu, type MenuProduct } from "@/lib/useMenu";
import { IconArrow, IconClose } from "../icons";
import { Logo } from "../Logo";

const WA_MSG = "Hi Victors, I'd like a quote for building materials.";

/**
 * Design C — Premium. Floating frosted-glass pill navbar; on phones the menu
 * rises from the bottom (thumb-reachable) with photo cards for each product.
 */
export function HeaderPremium({ products }: { products: MenuProduct[] }) {
  const { open, toggle, close, pathname } = useMenu();

  return (
    <>
      <header className="hp-wrap">
        <div className="hp-pill">
          <Logo />
          <nav className="hp-links" aria-label="Main">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={pathname === n.href ? "active" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/contact" className="hp-quote">
            Get a quote
          </Link>
          <button className="hp-menu" onClick={toggle} aria-expanded={open}>
            <span className="hp-dot" />
            Menu
          </button>
        </div>
      </header>

      <div className={`hp-scrim${open ? " open" : ""}`} onClick={close} aria-hidden />
      <div className={`hp-sheet${open ? " open" : ""}`} aria-hidden={!open}>
        <div className="hp-sheet-head">
          <span>Menu</span>
          <button onClick={close} aria-label="Close menu">
            <IconClose />
          </button>
        </div>
        <nav className="hp-sheet-links" aria-label="Mobile">
          {[{ href: "/", label: "Home" }, ...nav].map((n) => (
            <Link key={n.href} href={n.href} onClick={close}>
              {n.label}
              <IconArrow size={20} />
            </Link>
          ))}
        </nav>
        <div className="hp-cards">
          {products.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} onClick={close} className="hp-card">
              {p.img && <Image src={p.img} alt="" fill sizes="160px" />}
              <span>{p.name}</span>
            </Link>
          ))}
        </div>
        <a
          className="hp-sheet-cta"
          href={whatsappLink(WA_MSG)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("menu_premium")}
        >
          Chat with us on WhatsApp
        </a>
      </div>
    </>
  );
}
