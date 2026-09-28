import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Victors Holdings — Building Materials in Harare",
    template: "%s | Victors Holdings",
  },
  description:
    "Quality building materials and practical construction solutions for builders, contractors and property developers in Harare, Zimbabwe.",
  openGraph: { siteName: site.name, locale: "en_ZW", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
