import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/tora/LoginForm";

export const metadata: Metadata = { title: "Tora Mari login", robots: { index: false } };

export default function ToraMariLogin() {
  return (
    <section className="tm-auth-page">
      <div className="tm-auth">
        <div className="tm-auth-head">
          <span className="tm-badge">
            <b>Tora Mari</b> · by Victors Holdings
          </span>
          <h1>Welcome back</h1>
          <p>Log in with your WhatsApp number and password to see your referrals and payouts.</p>
        </div>
        <div className="tm-card">
          <LoginForm />
        </div>
        <div className="tm-auth-foot">
          <span className="tm-secure">🔒 Secure login · Victors Holdings, Mt Hampden, Harare</span>
          <span>
            Victors staff? <Link href="/admin/login">Staff login</Link>
          </span>
        </div>
      </div>
    </section>
  );
}
