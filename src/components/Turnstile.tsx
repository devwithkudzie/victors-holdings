"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<void> | null = null;
function loadScript() {
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Cloudflare Turnstile bot check. Invisible for most people ("interaction-only");
 * a quick checkbox appears only when Cloudflare isn't sure. Renders nothing if no site key is set.
 * Tokens are single-use: bump `resetKey` after each request to get a fresh one.
 */
export function Turnstile({ onToken, resetKey }: { onToken: (token: string | null) => void; resetKey: number }) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        id.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: "interaction-only",
          size: "flexible",
          callback: (t: string) => callback.current(t),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
        });
      })
      .catch(() => callback.current(null));
    return () => {
      cancelled = true;
      if (id.current) window.turnstile?.remove(id.current);
      id.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey && id.current) {
      callback.current(null);
      window.turnstile?.reset(id.current);
    }
  }, [resetKey]);

  return TURNSTILE_SITE_KEY ? <div ref={box} className="bc-turnstile" /> : null;
}
