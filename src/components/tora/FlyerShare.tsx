"use client";

import { useState } from "react";

const FORMATS = {
  square: { label: "Post (square)", hint: "WhatsApp chats, groups & Facebook" },
  story: { label: "Status (tall)", hint: "WhatsApp Status & stories" },
} as const;

/** "Your flyers": preview, one-tap share (image + link) and download */
export function FlyerShare({ code, link, shareText }: { code: string; link: string; shareText: string }) {
  const [format, setFormat] = useState<keyof typeof FORMATS>("square");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const src = `/api/flyer/${code}?size=${format}`;
  const filename = `victors-bricks-${code}-${format}.png`;

  async function share() {
    setBusy(true);
    setNote("");
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      const text = `${shareText}\n${link}`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
      } else {
        // Desktop / older phones: download the flyer and copy the message
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        await navigator.clipboard?.writeText(text).catch(() => {});
        setNote("Flyer downloaded and your message copied — paste it with the flyer.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setNote("Couldn't share — try Download instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tm-flyers">
      <div className="tm-seg" role="tablist">
        {(Object.keys(FORMATS) as (keyof typeof FORMATS)[]).map((f) => (
          <button key={f} type="button" role="tab" aria-selected={format === f} className={format === f ? "on" : undefined} onClick={() => setFormat(f)}>
            {FORMATS[f].label}
          </button>
        ))}
      </div>
      <p className="tm-small">{FORMATS[format].hint}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`tm-flyer ${format}`} src={src} alt={`Your ${FORMATS[format].label} flyer with code ${code}`} />
      <div className="tm-link-actions">
        <button type="button" className="tm-btn tm-wa" onClick={share} disabled={busy}>
          {busy ? "Preparing…" : "Share flyer"}
        </button>
        <a className="tm-btn" href={src} download={filename}>
          Download
        </a>
      </div>
      {note && <p className="tm-small">{note}</p>}
    </div>
  );
}
