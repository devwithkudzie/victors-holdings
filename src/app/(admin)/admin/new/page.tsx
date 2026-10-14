import { ActionForm } from "@/components/tora/ActionForm";
import { AdminNav } from "@/components/tora/AdminNav";
import { recordOrder, requireStaff } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewOrder({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const me = await requireStaff();
  const { code } = await searchParams;
  return (
    <>
      <AdminNav name={me.name} role={me.role} />
      <section className="adm-body">
        <h1>Record a referred order</h1>
        <p className="muted">
          Use the code from the WhatsApp chat (&ldquo;Ref: TENDAI20&rdquo;), or ask the customer &ldquo;Who referred you?&rdquo; and enter their
          code or WhatsApp number.
        </p>
        <ActionForm action={recordOrder} submit="Record order" className="tm-form adm-form">
          <label>
            Affiliate code or WhatsApp number
            <input name="affiliate" defaultValue={code} placeholder="TENDAI20 or 077 123 4567" required />
          </label>
          <label>
            Customer WhatsApp number
            <input name="customerPhone" inputMode="tel" placeholder="077 …" required />
          </label>
          <label>
            Customer area
            <input name="customerArea" placeholder="e.g. Ruwa" required />
          </label>
          <label>
            Order
            <input name="description" placeholder="e.g. 10,000 Blue Heart bricks" required />
          </label>
          <label>
            Order value (US$)
            <input name="orderValue" type="number" step="0.01" min="0" required />
          </label>
        </ActionForm>
      </section>
    </>
  );
}
