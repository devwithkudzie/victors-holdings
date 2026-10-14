import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Embedded Postgres for local development only (production uses Neon)
  serverExternalPackages: ["@electric-sql/pglite"],
  // The quotation PDF embeds the logo, so ship it with that function
  outputFileTracingIncludes: {
    "/api/bricks/quote-pdf": ["./public/images/logo-horizontal.png"],
    "/api/flyer/[code]": ["./public/images/logo-horizontal.png", "./public/images/hero/blue-heart-mobile.jpg"],
  },
  images: {
    // Smaller modern formats first — matters for visitors paying for mobile data
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
