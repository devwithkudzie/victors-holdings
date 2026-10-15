"use client";

import { trackWhatsAppClick } from "@/lib/analytics";
import { reportLead, withRef } from "@/lib/referral";
import { openWhatsApp, whatsappLink } from "@/lib/site";

type Props = {
  message: string;
  source: string;
  children?: React.ReactNode;
  className?: string;
};

/** Opens a WhatsApp chat directly (no form). For quote requests use QuoteButton instead. */
export function WhatsAppButton({ message, source, children = "Chat on WhatsApp", className = "primary" }: Props) {
  const url = whatsappLink(message);
  return (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        trackWhatsAppClick(source);
        // Referred visitors who open a WhatsApp chat with Victors count as reaching Victors
        reportLead(source, "Opened a WhatsApp chat with Victors");
        openWhatsApp(whatsappLink(withRef(message)));
      }}
    >
      {children}
    </a>
  );
}
