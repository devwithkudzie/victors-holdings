import { asc } from "drizzle-orm";
import { ActionForm } from "@/components/tora/ActionForm";
import { AdminShell } from "@/components/tora/AdminShell";
import { getDb } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { addStaff, attentionCount, ownerId, requireStaff, resetStaffPassword, setStaffActive } from "../actions";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const me = await requireStaff("admin");
  const db = await getDb();
  const [list, owner] = await Promise.all([db.select().from(staff).orderBy(asc(staff.createdAt)), ownerId()]);
  const isOwner = me.id === owner;
  // Owner manages everyone; admins manage sales people only
  const manageable = (s: (typeof list)[number]) => s.id !== me.id && s.id !== owner && (isOwner || s.role === "sales");
  const role = (s: (typeof list)[number]) => (s.id === owner ? "Owner" : s.role === "admin" ? "Admin" : "Sales");

  return (
    <AdminShell name={me.name} role={me.role} attention={await attentionCount(me.role)} title="Staff">
      <div className="ad-grid">
        <section className="ad-card">
          <h2>Team ({list.filter((s) => s.active).length})</h2>
          <ul className="ad-people">
            {list.map((s) => (
              <li key={s.id} className={s.active ? undefined : "off"}>
                <span className="ad-avatar">{s.name.charAt(0)}</span>
                <div>
                  <b>
                    {s.name}
                    {s.id === me.id && <span className="ad-muted"> (you)</span>}
                  </b>
                  <small>{s.email}</small>
                </div>
                <span className={`ad-pill ${!s.active ? "s-rejected" : s.role === "admin" ? "s-approved" : "s-recorded"}`}>{s.active ? role(s) : "No access"}</span>
                {manageable(s) && (
                  <form action={setStaffActive}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="active" value={s.active ? "0" : "1"} />
                    <button type="submit" className="ad-btn">
                      {s.active ? "Remove" : "Restore"}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <p className="ad-muted">
            <b>Sales</b> record orders and mark them delivered &amp; paid. <b>Admins</b> also approve and pay out, reset affiliate passwords and
            manage sales people. {isOwner ? "Only you (the owner) can add or remove admins." : "Only the owner can add or remove admins."}
          </p>
        </section>

        <div className="ad-stack">
          <section className="ad-card">
            <h2>{isOwner ? "Add a staff member" : "Add a sales person"}</h2>
            <ActionForm action={addStaff} submit={isOwner ? "Add staff" : "Add sales person"} className="ad-form">
              <label>
                Name
                <input name="name" required />
              </label>
              <label>
                Email (they log in with this)
                <input name="email" type="email" required />
              </label>
              <label>
                Temporary password (10+ characters)
                <input name="password" type="text" minLength={10} autoComplete="off" required />
              </label>
              {isOwner ? (
                <label>
                  Role
                  <select name="role">
                    <option value="sales">Sales</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              ) : (
                <input type="hidden" name="role" value="sales" />
              )}
            </ActionForm>
          </section>

          {list.some((s) => s.active && manageable(s)) && (
            <section className="ad-card">
              <h2>Reset a staff password</h2>
              <ActionForm action={resetStaffPassword} submit="Set new password" className="ad-form">
                <label>
                  Team member
                  <select name="id" required>
                    {list
                      .filter((s) => s.active && manageable(s))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({role(s)})
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  New temporary password (10+ characters)
                  <input name="password" type="text" minLength={10} autoComplete="off" required />
                </label>
              </ActionForm>
            </section>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
