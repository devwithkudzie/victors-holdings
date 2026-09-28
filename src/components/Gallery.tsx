"use client";

import Image from "next/image";
import { useState } from "react";

/** Main product photo with clickable thumbnails for the other angles. */
export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="gallery">
      <div className="photo gallery-main">
        <Image
          src={photos[active]}
          alt={`${alt} — photo ${active + 1} of ${photos.length}`}
          fill
          sizes="(max-width: 800px) 100vw, 50vw"
          priority
        />
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`photo gallery-thumb${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
            >
              <Image src={src} alt="" fill sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
