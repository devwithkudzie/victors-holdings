import { site } from "@/lib/site";

/** Local business details for Google / AI search. Keep in sync with the Google Business Profile. */
export function BusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: site.name,
    url: site.url,
    logo: `${site.url}/images/logo-stacked.png`,
    image: `${site.url}/images/home-hero.jpeg`,
    telephone: `+${site.whatsapp}`,
    description:
      "Building materials supplier in Mt Hampden, Harare: bricks, cement, quarry stones, river sand, pit sand, aggregates and roofing materials for residential, commercial and industrial projects.",
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: [{ "@type": "City", name: "Harare" }, { "@type": "Country", name: "Zimbabwe" }],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
