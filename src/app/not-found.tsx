import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <>
      <header className="nav">
        <Logo />
      </header>
      <section className="page-head">
        <div className="eyebrow">404</div>
        <h1>Page not found.</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="actions">
          <Link className="primary" href="/products">
            Browse products
          </Link>
          <Link className="secondary" href="/">
            Home
          </Link>
        </div>
      </section>
    </>
  );
}
