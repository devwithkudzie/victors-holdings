import Link from "next/link";
import type { Product } from "@/lib/products";
import { productImage } from "@/lib/images";
import { Photo } from "./Photo";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="product">
      <Photo
        name={productImage(product.slug)}
        alt={product.name}
        fallback={product.swatch}
        className="productimg"
        sizes="(max-width: 800px) 100vw, 33vw"
      />
      <div className="productbody">
        <h3>{product.name}</h3>
        <p>{product.summary}</p>
        <span className="tag">
          {product.variants.length > 1 ? `${product.variants.length} types · ` : ""}View product →
        </span>
      </div>
    </Link>
  );
}
