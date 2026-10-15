import { asc } from "drizzle-orm";
import { ActionForm } from "@/components/tora/ActionForm";
import { AdminShell } from "@/components/tora/AdminShell";
import { getDb } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { addStaff, attentionCount, requireStaff } from "../actions";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const me = await requireStaff("admin");
  const db = await getDb();
  const list = await db.select().from(staff).orderBy(asc(staff.createdAt));
  return (
    <AdminShell name={me.name} role={me.role} attention={await attentionCount(me.role)} title="Staff">
      <div className="ad-grid">
        <section className="ad-card">
          <h2>Team ({list.length})</h2>
          <ul className="ad-people">
            {list.map((s) => (
              <li key={s.id}>
                <span className="ad-avatar">{s.name.charAt(0)}</span>
                <div>
                  <b>{s.name}</b>
                  <small>{s.email}</small>
                </div>
                <span className={`ad-pill ${s.role === "admin" ? "s-approved" : "s-recorded"}`}>{s.role === "admin" ? "Admin" : "Sales"}</span>
              </li>
            ))}
          </ul>
          <p className="ad-muted">
            <b>Sales</b> record orders and mark them delivered &amp; paid. <b>Admins</b> also approve and pay out, reset affiliate passwords and
            add staff.
          </p>
        </section>
        <section className="ad-card">
          <h2>Add a staff member</h2>
          <ActionForm action={addStaff} submit="Add staff" className="ad-form">
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Temporary password (10+ characters)
              <input name="password" type="text" minLength={10} autoComplete="off" required />
            </label>
            <label>
              Role
              <select name="role">
                <option value="sales">Sales</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </ActionForm>
        </section>
      </div>
    </AdminShell>
  );
}
