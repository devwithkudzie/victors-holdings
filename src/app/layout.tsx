import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { site } from "@/lib/site";
import "./globals.css";
import "./theme.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--f-body" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--f-app" });

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e4d2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
