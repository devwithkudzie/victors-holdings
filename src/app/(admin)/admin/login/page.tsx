import { ActionForm } from "@/components/tora/ActionForm";
import { staffLogin } from "../actions";

export default function StaffLogin() {
  return (
    <section className="adm-login">
      <h1>Staff login</h1>
      <ActionForm action={staffLogin} submit="Log in">
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
      </ActionForm>
    </section>
  );
}
