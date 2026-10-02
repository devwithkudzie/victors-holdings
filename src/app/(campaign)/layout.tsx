import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

/**
 * Stripped-down layout for paid-campaign landing pages: no main navigation,
 * so visitors from Facebook/Instagram/WhatsApp stay focused on enquiring.
 */
export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="nav campaign-nav">
        <Logo />
      </header>
      <main>{children}</main>
      <footer className="footer footer-slim">
        <div>
          <b>VICTORS HOLDINGS</b> · {site.tagline}
        </div>
        <div>{site.location}</div>
      </footer>
    </>
  );
}
