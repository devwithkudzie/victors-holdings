/** Browser-side referral helpers: the saved code travels into every WhatsApp message */

export function refCode(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)vh_ref=([A-Z0-9]+)/);
  return m ? m[1] : null;
}

/** Adds "Ref: CODE" to a WhatsApp message when the visitor came through a referral link */
export function withRef(message: string) {
  const code = refCode();
  return code && !message.includes(`Ref: ${code}`) ? `${message}\n\nRef: ${code}` : message;
}

/** Counts a quote request as a lead for the referring affiliate */
export function reportLead(source: string, summary: string) {
  if (!refCode()) return;
  fetch("/api/ref/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, summary }),
    keepalive: true,
  }).catch(() => {});
}
