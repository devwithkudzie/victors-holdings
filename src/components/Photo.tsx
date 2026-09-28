import Image from "next/image";
import type { Product } from "@/lib/products";
import { resolveImage } from "@/lib/resolve-image";
import { Swatch } from "./Swatch";

type Props = {
  /** Image name without extension, e.g. "home-hero" */
  name: string;
  alt: string;
  /** Texture shown if the image file doesn't exist yet */
  fallback: Product["swatch"];
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Renders the photo from /public/images if it exists, otherwise a material texture. */
export function Photo({ name, alt, fallback, className = "", sizes = "(max-width: 800px) 100vw, 50vw", priority }: Props) {
  const src = resolveImage(name);
  if (!src) return <Swatch kind={fallback} className={className} />;
  return (
    <div className={`photo ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </div>
  );
}
