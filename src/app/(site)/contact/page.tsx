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
        <div>
          <div className="eyebrow">Contact</div>
          <h1>Get a quote.</h1>
          <p className="muted">
            Tell us what you need, how much and where you&apos;re building. The form opens WhatsApp with your request
            ready to send. Just want to chat? Use the WhatsApp number below.
          </p>
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
        <div className="lead-card">
          <LeadForm inline source="contact_page" />
        </div>
      </div>
    </section>
  );
}
