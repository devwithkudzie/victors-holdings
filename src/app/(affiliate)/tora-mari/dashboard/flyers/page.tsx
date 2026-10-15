import { AffiliateShell } from "@/components/tora/AffiliateShell";
import { FlyerShare } from "@/components/tora/FlyerShare";
import { requireAffiliate } from "../data";

export const dynamic = "force-dynamic";

export default async function Flyers() {
  const { affiliate: a, link } = await requireAffiliate();
  return (
    <AffiliateShell name={a.name} code={a.code} title="Flyers">
      <section className="ad-card">
        <p className="ad-muted">Ready-made flyers with your code and a QR code that opens your link. Prices update automatically.</p>
        <FlyerShare code={a.code} link={link} shareText="Building? Quality bricks delivered nationwide — pay on delivery. Get a quote with my link:" />
      </section>
    </AffiliateShell>
  );
}
