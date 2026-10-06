import type { Metadata } from "next";
import { LeadForm } from "@/components/QuoteSheet";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Quotes",
  description: "Get a quote for building materials from Victors Holdings in Harare. Enquire on WhatsApp.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="section enquire-section contact-page">
      <div className="enquire-grid">
        <div className="contact-head">
          <div className="eyebrow">Contact</div>
          <h1>Get a quote.</h1>
        </div>
        <div className="lead-card">
          <LeadForm inline source="contact_page" />
        </div>
        <div className="contact-list">
          <div>
            <b>WhatsApp</b>
            <WhatsAppButton message="Hi Victors, I have an enquiry." source="contact_page" className="text-link">
              +{site.whatsapp} →
            </WhatsAppButton>
          </div>
          <div>
            <b>Location</b>
            <span>{site.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
