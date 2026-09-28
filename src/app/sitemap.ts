import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

// The campaign page (/red-common-bricks) is intentionally excluded — it's noindexed.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/products", "/about", "/contact", ...products.map((p) => `/products/${p.slug}`)];
  return paths.map((path) => ({ url: `${site.url}${path}`, lastModified: new Date() }));
}
