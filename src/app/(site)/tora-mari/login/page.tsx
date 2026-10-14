import type { Metadata } from "next";
import { LoginForm } from "@/components/tora/LoginForm";

export const metadata: Metadata = { title: "Tora Mari login", robots: { index: false } };

export default function ToraMariLogin() {
  return (
    <section className="section tm-auth">
      <h1 className="section-title">Log in to Tora Mari</h1>
      <div className="tm-card">
        <LoginForm />
      </div>
    </section>
  );
}
