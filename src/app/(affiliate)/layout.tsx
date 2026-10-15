import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Tora Mari", robots: { index: false, follow: false } };

/** Affiliate app: no website header or footer — the dashboard has its own navigation */
export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
