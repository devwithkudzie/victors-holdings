"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { staffLogout } from "@/app/(admin)/admin/actions";
import logo from "../../../public/images/logo-horizontal.png";

const ICONS = {
  overview: "M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z",
  orders: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 13l2 2 4-4",
  new: "M12 5v14M5 12h14",
  affiliates: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  staff: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  account: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  site: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "M18 6 6 18M6 6l12 12",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
};
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Props = { name: string; role: string; attention?: number; title: string; actions?: React.ReactNode; children: React.ReactNode };

/** Admin layout: sidebar on desktop; top bar + slide-in sidebar + bottom tabs on phones */
export function AdminShell({ name, role, attention = 0, title, actions, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const nav = [
    { href: "/admin", label: "Overview", icon: ICONS.overview },
    { href: "/admin/orders", label: "Orders", icon: ICONS.orders, badge: attention },
    { href: "/admin/new", label: "Record order", icon: ICONS.new },
    { href: "/admin/affiliates", label: "Affiliates", icon: ICONS.affiliates },
    ...(role === "admin" ? [{ href: "/admin/staff", label: "Staff", icon: ICONS.staff }] : []),
    { href: "/admin/account", label: "My account", icon: ICONS.account },
  ];
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className={`ad${open ? " is-open" : ""}`}>
      <aside className="ad-side" aria-label="Admin navigation">
        <div className="ad-brand">
          <Image src={logo} alt="Victors Holdings" height={30} />
          <span>Tora Mari admin</span>
          <button type="button" className="ad-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon d={ICONS.close} />
          </button>
        </div>
        <nav className="ad-nav">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={isActive(n.href) ? "on" : undefined}>
              <Icon d={n.icon} />
              <span>{n.label}</span>
              {!!n.badge && <em>{n.badge}</em>}
            </Link>
          ))}
          <Link href="/" target="_blank">
            <Icon d={ICONS.site} />
            <span>View website</span>
          </Link>
        </nav>
        <div className="ad-user">
          <span className="ad-avatar">{name.charAt(0).toUpperCase()}</span>
          <div>
            <b>{name}</b>
            <small>{role === "admin" ? "Admin" : "Sales"}</small>
          </div>
          <form action={staffLogout}>
            <button type="submit" aria-label="Log out" title="Log out">
              <Icon d={ICONS.logout} />
            </button>
          </form>
        </div>
      </aside>
      <div className="ad-scrim" onClick={() => setOpen(false)} aria-hidden />

      <div className="ad-main">
        <header className="ad-top">
          <button type="button" className="ad-menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <Icon d={ICONS.menu} />
          </button>
          <h1>{title}</h1>
          <div className="ad-top-actions">{actions}</div>
        </header>
        <main className="ad-content">{children}</main>
      </div>

      <nav className="ad-tabs" aria-label="Quick navigation">
        {nav.slice(0, 4).map((n) => (
          <Link key={n.href} href={n.href} className={isActive(n.href) ? "on" : undefined}>
            <Icon d={n.icon} size={22} />
            <span>{n.label === "Record order" ? "Record" : n.label}</span>
            {!!n.badge && <em>{n.badge}</em>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
