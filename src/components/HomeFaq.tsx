import Link from "next/link";
import { faqs } from "@/lib/faq";

/** Top questions on the homepage, linking to the full FAQ */
export function HomeFaq() {
  return (
    <section className="section home-faq" aria-labelledby="home-faq-title">
      <div className="sectionhead">
        <div>
          <h2 id="home-faq-title" className="section-title">FAQ</h2>
        </div>
        <Link href="/faq" className="text-link">
          All questions →
        </Link>
      </div>
      <div className="faq">
        {faqs.slice(2, 7).map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
