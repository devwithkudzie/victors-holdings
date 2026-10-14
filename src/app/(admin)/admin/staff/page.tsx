import { asc } from "drizzle-orm";
import { ActionForm } from "@/components/tora/ActionForm";
import { AdminNav } from "@/components/tora/AdminNav";
import { getDb } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { addStaff, requireStaff } from "../actions";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const me = await requireStaff("admin");
  const db = await getDb();
  const list = await db.select().from(staff).orderBy(asc(staff.createdAt));
  return (
    <>
      <AdminNav name={me.name} role={me.role} />
      <section className="adm-body">
        <h1>Staff</h1>
        <p className="muted">
          <b>Sales</b> can record orders and mark them delivered & paid. <b>Admins</b> can also approve and record payouts, reset PINs and add
          staff.
        </p>
        <ul className="adm-list">
          {list.map((s) => (
            <li key={s.id}>
              {s.name} — {s.email} ({s.role})
            </li>
          ))}
        </ul>
        <h2>Add a staff member</h2>
        <ActionForm action={addStaff} submit="Add staff" className="tm-form adm-form">
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
            <input name="password" type="text" minLength={10} required />
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
    </>
  );
}
