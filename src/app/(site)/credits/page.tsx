import type { Metadata } from "next";
import { imageCredits } from "@/lib/image-credits";

export const metadata: Metadata = {
  title: "Photo credits",
  robots: { index: false, follow: true },
};

export default function CreditsPage() {
  return (
    <section className="page-head">
      <div className="eyebrow">Credits</div>
      <h1>Photo credits</h1>
      {imageCredits.length === 0 ? (
        <p>All photography © Victors Holdings.</p>
      ) : (
        <ul className="credits">
          {imageCredits.map((c) => (
            <li key={c.file}>
              {c.file} — photo by {c.author} ({c.license})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
