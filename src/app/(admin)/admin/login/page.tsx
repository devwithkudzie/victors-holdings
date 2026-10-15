import Image from "next/image";
import { ActionForm } from "@/components/tora/ActionForm";
import logo from "../../../../../public/images/logo-horizontal.png";
import { staffLogin } from "../actions";

export default function StaffLogin() {
  return (
    <section className="adm-login">
      <div className="adm-login-card">
        <Image src={logo} alt="Victors Holdings" height={34} />
        <div>
          <h1>Staff login</h1>
          <p>Tora Mari orders, affiliates and payouts.</p>
        </div>
        <ActionForm action={staffLogin} submit="Log in" className="ad-form">
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
        </ActionForm>
      </div>
    </section>
  );
}
