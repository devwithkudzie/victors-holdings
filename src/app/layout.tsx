import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Fraunces, Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@/components/Analytics";
import { designBootScript, defaultDesign } from "@/lib/designs";
import { site } from "@/lib/site";
import "./globals.css";
import "./designs.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--f-body" });
// Display fonts for the three design variations
const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--f-bold" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--f-app" });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", variable: "--f-serif" });

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
  themeColor: "#121110",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-design={defaultDesign}
      className={`${inter.variable} ${barlow.variable} ${jakarta.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Applies the chosen design before first paint (no flash) */}
        <Script id="design-boot" strategy="beforeInteractive">
          {designBootScript}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
