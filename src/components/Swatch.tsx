import type { Product } from "@/lib/products";

/**
 * Placeholder material texture. Replace with real product photography
 * (e.g. /public/images/red-common-bricks.jpg + next/image) once available.
 */
export function Swatch({ kind, className = "" }: { kind: Product["swatch"]; className?: string }) {
  return <div className={`swatch swatch-${kind} ${className}`} aria-hidden="true" />;
}
