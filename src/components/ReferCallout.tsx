import Link from "next/link";
import { PROGRAMME } from "@/lib/affiliate-rules";

const STEPS = ["Join free and get your link", "Share it with anyone building", `Get ${PROGRAMME.currency}${PROGRAMME.reward} when they order`];

/** Homepage callout for the Tora Mari referral programme */
export function ReferCallout() {
  return (
    <section className="section refer" aria-labelledby="refer-title">
      <div className="refer-panel">
        <div className="refer-copy">
          <p className="refer-kicker">Tora Mari · Refer &amp; earn</p>
          <h2 id="refer-title" className="section-title">
            Earn {PROGRAMME.currency}
            {PROGRAMME.reward} for every customer you refer
          </h2>
          <ol className="refer-steps">
            {STEPS.map((s, i) => (
              <li key={s}>
                <span>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="refer-actions">
          <b className="refer-amount">
            {PROGRAMME.currency}
            {PROGRAMME.reward}
            <small>per successful referral</small>
          </b>
          <Link href="/tora-mari" className="tm-btn">
            Join free →
          </Link>
          <Link href="/tora-mari#rules" className="refer-link">
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
