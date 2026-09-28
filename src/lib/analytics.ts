type Params = Record<string, string | number | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a conversion event to GA4 and Meta Pixel (whichever are configured).
 * `source` distinguishes campaign traffic from the evergreen site, e.g.
 * "campaign_red_common_bricks" vs "product_page".
 */
export function trackLead(source: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "generate_lead", { source, ...params });
  window.fbq?.("track", "Lead", { content_name: source, ...params });
}

export function trackWhatsAppClick(source: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "whatsapp_click", { source, ...params });
  window.fbq?.("track", "Contact", { content_name: source, ...params });
}
