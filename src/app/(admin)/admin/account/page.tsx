import { ActionForm } from "@/components/tora/ActionForm";
import { AdminShell } from "@/components/tora/AdminShell";
import { attentionCount, changePassword, requireStaff } from "../actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const me = await requireStaff();
  return (
    <AdminShell name={me.name} role={me.role} attention={await attentionCount(me.role)} title="My account">
      <div className="ad-narrow">
        <section className="ad-card">
          <h2>{me.name}</h2>
          <p className="ad-muted">
            {me.email} · {me.role === "admin" ? "Admin" : "Sales"}
          </p>
        </section>
        <section className="ad-card">
          <h2>Change password</h2>
          <ActionForm action={changePassword} submit="Change password" className="ad-form">
            <label>
              Current password
              <input name="current" type="password" autoComplete="current-password" required />
            </label>
            <label>
              New password (10+ characters)
              <input name="next" type="password" minLength={10} autoComplete="new-password" required />
            </label>
            <label>
              Confirm new password
              <input name="confirm" type="password" minLength={10} autoComplete="new-password" required />
            </label>
          </ActionForm>
        </section>
      </div>
    </AdminShell>
  );
}
