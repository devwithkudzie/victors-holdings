import Image from "next/image";
import Link from "next/link";
import type { ShopItem } from "@/lib/shop";
import { AskButton } from "./QuoteSheet";

/** Product card: photo, name, price and a "Choose options" button that opens the quote form */
export function ProductTile({ item, source }: { item: ShopItem; source: string }) {
  return (
    <article className="tile">
      <Link href={item.href} className="tile-img" tabIndex={-1} aria-hidden>
        {item.img && <Image src={item.img} alt="" fill sizes="(max-width: 899px) 50vw, 25vw" />}
        {item.save && <span className="tile-badge">{item.save}</span>}
      </Link>
      <div className="tile-body">
        <span className="tile-type">{item.type}</span>
        <Link href={item.href} className="tile-name">
          {item.name}
        </Link>
        <span className="tile-price">
          {item.price ? <b>{item.price}</b> : <b className="is-ask">Ask for price</b>}
          {item.was && <s>{item.was}</s>}
        </span>
      </div>
      <div className="tile-actions">
        <AskButton product={item.name} img={item.img} source={source} label="Choose options" className="tile-cta" />
        <Link href={item.href} className="tile-link">
          View details
        </Link>
      </div>
    </article>
  );
}
