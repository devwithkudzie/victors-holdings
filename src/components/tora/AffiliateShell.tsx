"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(site)/tora-mari/actions";
import logo from "../../../public/images/logo-horizontal.png";

const I = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  referrals: "M3 3v18h18M7 15l4-4 3 3 6-6",
  flyers: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01",
  payouts: "M2 6h20v12H2zM2 10h20M6 15h4",
  account: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  site: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
};
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV = [
  { href: "/tora-mari/dashboard", label: "Home", icon: I.home },
  { href: "/tora-mari/dashboard/activity", label: "Activity", icon: I.referrals },
  { href: "/tora-mari/dashboard/flyers", label: "Flyers", icon: I.flyers },
  { href: "/tora-mari/dashboard/orders", label: "Orders", icon: I.payouts },
  { href: "/tora-mari/dashboard/account", label: "Account", icon: I.account },
];

/** Affiliate app layout: bottom tabs on phones, sidebar on desktop — no website header */
export function AffiliateShell({ name, code, title, children }: { name: string; code: string; title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === NAV[0].href ? pathname === href : pathname.startsWith(href));
  return (
    <div className="ad af">
      <aside className="ad-side" aria-label="Tora Mari navigation">
        <div className="ad-brand">
          <Image src={logo} alt="Victors Holdings" height={30} />
          <span>Tora Mari</span>
        </div>
        <nav className="ad-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isActive(n.href) ? "on" : undefined}>
              <Icon d={n.icon} />
              <span>{n.label}</span>
            </Link>
          ))}
          <Link href="/" target="_blank">
            <Icon d={I.site} />
            <span>Victors website</span>
          </Link>
        </nav>
        <div className="ad-user">
          <span className="ad-avatar">{name.charAt(0).toUpperCase()}</span>
          <div>
            <b>{name}</b>
            <small>Code {code}</small>
          </div>
          <form action={logout}>
            <button type="submit" aria-label="Log out" title="Log out">
              <Icon d={I.logout} />
            </button>
          </form>
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-top af-top">
          <Image src={logo} alt="Victors Holdings" height={24} className="af-logo" />
          <h1>{title}</h1>
          <span className="af-code">{code}</span>
        </header>
        <main className="ad-content">{children}</main>
      </div>

      <nav className="ad-tabs af-tabs" aria-label="Tora Mari">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={isActive(n.href) ? "on" : undefined}>
            <Icon d={n.icon} size={22} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
