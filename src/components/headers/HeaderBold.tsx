"use client";

import Image from "next/image";
import Link from "next/link";
import { trackWhatsAppClick } from "@/lib/analytics";
import { nav, site, whatsappLink } from "@/lib/site";
import { useMenu, type MenuProduct } from "@/lib/useMenu";
import { DesignSwitch } from "../DesignSwitch";
import { IconArrow, IconChat, IconPhone, IconQuote } from "../icons";
import { Logo } from "../Logo";

const WA_MSG = "Hi Victors, I'd like a quote for building materials.";

/**
 * Design A — Bold. Dark bar, full-screen overlay menu with oversized type,
 * and a sticky Call / WhatsApp / Quote action bar at the bottom on phones.
 */
export function HeaderBold({ products }: { products: MenuProduct[] }) {
  const { open, toggle, close, pathname } = useMenu();

  return (
    <>
      <header className="hb-bar">
        <Logo light />
        <nav className="hb-links" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={pathname === n.href ? "active" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hb-right">
          <DesignSwitch compact />
          <Link href="/contact" className="hb-quote">Get a quote</Link>
          <button className={`hb-burger${open ? " open" : ""}`} onClick={toggle} aria-expanded={open} aria-label="Menu">
            <span />
            <span />
            <em>{open ? "Close" : "Menu"}</em>
          </button>
        </div>
      </header>

      <div className={`hb-overlay${open ? " open" : ""}`} aria-hidden={!open}>
        <nav className="hb-overlay-links" aria-label="Mobile">
          {[{ href: "/", label: "Home" }, ...nav].map((n, i) => (
            <Link key={n.href} href={n.href} onClick={close} style={{ transitionDelay: `${60 + i * 50}ms` }}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hb-overlay-products">
          <span className="hb-kicker">Products</span>
          <div className="hb-chips">
            {products.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} onClick={close}>
                {p.img && <Image src={p.img} alt="" width={40} height={40} />}
                {p.name}
              </Link>
            ))}
          </div>
        </div>
        <a
          className="hb-overlay-cta"
          href={whatsappLink(WA_MSG)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("menu_bold")}
        >
          Get a quote on WhatsApp <IconArrow />
        </a>
        <DesignSwitch />
      </div>

      <div className="hb-dock">
        <a href={`tel:+${site.whatsapp}`}>
          <IconPhone size={20} />
          Call
        </a>
        <a
          href={whatsappLink(WA_MSG)}
          target="_blank"
          rel="noopener noreferrer"
          className="hb-dock-main"
          onClick={() => trackWhatsAppClick("dock_bold")}
        >
          <IconChat size={20} />
          WhatsApp
        </a>
        <Link href="/contact">
          <IconQuote size={20} />
          Quote
        </Link>
      </div>
    </>
  );
}
