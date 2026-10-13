"use client";

import Link from "next/link";
import { useState } from "react";
import type { ShopItem } from "@/lib/shop";
import { ProductTile } from "./ProductTile";

/** "Shop bricks by type" — tabs for All and each brick type */
export function ShopByType({ items, types }: { items: ShopItem[]; types: string[] }) {
  const [tab, setTab] = useState("All");
  const shown = tab === "All" ? items : items.filter((i) => i.type === tab);

  return (
    <section className="section shop" aria-labelledby="shop-title">
      <div className="sectionhead">
        <div>
          <h2 id="shop-title" className="section-title">Our brick collections</h2>
        </div>
        <Link href="/products" className="text-link">
          All products →
        </Link>
      </div>

      <div className="shop-tabs" role="tablist" aria-label="Brick types">
        {["All", ...types].map((t) => {
          const count = t === "All" ? items.length : items.filter((i) => i.type === t).length;
          return (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? "on" : undefined} onClick={() => setTab(t)}>
              {t === "All" ? "All" : t} <em>{count}</em>
            </button>
          );
        })}
      </div>

      <div className="tile-grid" role="tabpanel">
        {shown.map((item) => (
          <ProductTile key={item.key} item={item} source="home_shop" />
        ))}
      </div>
    </section>
  );
}
