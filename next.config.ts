import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The quotation PDF embeds the logo, so ship it with that function
  outputFileTracingIncludes: {
    "/api/bricks/quote-pdf": ["./public/images/logo-horizontal.png"],
  },
  images: {
    // Smaller modern formats first — matters for visitors paying for mobile data
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
