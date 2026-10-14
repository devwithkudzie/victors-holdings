"use client";

import { useState } from "react";

/** Referral link with Copy and Share-on-WhatsApp buttons */
export function CopyLink({ link, shareText }: { link: string; shareText: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="tm-link">
      <code>{link}</code>
      <div className="tm-link-actions">
        <button
          type="button"
          className="tm-btn"
          onClick={async () => {
            await navigator.clipboard?.writeText(link).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <a className="tm-btn tm-wa" href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${link}`)}`} target="_blank" rel="noopener noreferrer">
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
