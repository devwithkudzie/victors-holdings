import Image from "next/image";
import type { Product } from "@/lib/products";
import { resolveImage } from "@/lib/resolve-image";
import { Swatch } from "./Swatch";
import { AskButton } from "./QuoteSheet";

type Props = {
  product: Product;
  /** Analytics source label */
  source: string;
  /** Shown at the bottom of the WhatsApp message, e.g. "Bricks ad" */
  leadRef?: string;
};

/**
 * The individual items in a category, as listed in Victors' WhatsApp catalogue.
 * Photos: /public/images/catalog/<variant-slug>.jpg
 */
export function VariantList({ product, source, leadRef }: Props) {
  return (
    <div className="variants">
      {product.variants.map((v) => {
        const img = resolveImage(`catalog/${v.slug}`);
        return (
          <article key={v.slug} className="variant">
            <div className="variant-img">
              {img ? <Image src={img} alt={v.name} fill sizes="96px" /> : <Swatch kind={product.swatch} />}
            </div>
            <div className="variant-body">
              <h3>{v.name}</h3>
              {v.note && <p>{v.note}</p>}
              <span className="variant-price">Ask for today&apos;s price</span>
            </div>
            <AskButton
              product={v.name}
              img={img}
              quantityOptions={product.quantityOptions}
              source={source}
              leadRef={leadRef}
            />
          </article>
        );
      })}
      <p className="variants-note">Prices change often. Tap Ask to get today&apos;s price and delivery cost on WhatsApp.</p>
    </div>
  );
}
