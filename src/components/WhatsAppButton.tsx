"use client";

import { trackWhatsAppClick } from "@/lib/analytics";
import { whatsappLink } from "@/lib/site";

type Props = {
  message: string;
  source: string;
  children?: React.ReactNode;
  className?: string;
};

export function WhatsAppButton({ message, source, children = "Get a Quote on WhatsApp →", className = "primary" }: Props) {
  return (
    <a
      className={className}
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick(source)}
    >
      {children}
    </a>
  );
}
