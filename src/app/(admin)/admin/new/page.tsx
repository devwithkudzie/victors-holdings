import { ActionForm } from "@/components/tora/ActionForm";
import { AdminShell } from "@/components/tora/AdminShell";
import { attentionCount, recordOrder, requireStaff } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewOrder({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const me = await requireStaff();
  const { code } = await searchParams;
  return (
    <AdminShell name={me.name} role={me.role} attention={await attentionCount(me.role)} title="Record an order">
      <div className="ad-narrow">
        <div className="ad-card ad-help">
          <b>Where to find the code</b>
          <p>
            It&apos;s at the end of the customer&apos;s WhatsApp message (&ldquo;Ref: TENDAI20&rdquo;). No code? Ask &ldquo;Who referred you?&rdquo;
            and enter the affiliate&apos;s code or WhatsApp number.
          </p>
        </div>
        <section className="ad-card">
          <ActionForm action={recordOrder} submit="Record order" className="ad-form">
            <label>
              Affiliate code or WhatsApp number
              <input name="affiliate" defaultValue={code} placeholder="TENDAI20 or 077 123 4567" required />
              <small>Look for &quot;Ref: CODE&quot; in the customer&apos;s WhatsApp messages, or ask who sent them. The affiliate&apos;s number works too.</small>
            </label>
            <div className="ad-two">
              <label>
                Customer WhatsApp number
                <input name="customerPhone" inputMode="tel" placeholder="077 …" required />
              </label>
              <label>
                Customer area
                <input name="customerArea" placeholder="e.g. Ruwa" required />
              </label>
            </div>
            <div className="ad-two">
              <label>
                Order
                <input name="description" placeholder="e.g. 10,000 Blue Heart bricks" required />
              </label>
              <label>
                Order value (US$)
                <input name="orderValue" type="number" inputMode="decimal" step="0.01" min="0" required />
              </label>
            </div>
          </ActionForm>
        </section>
      </div>
    </AdminShell>
  );
}
