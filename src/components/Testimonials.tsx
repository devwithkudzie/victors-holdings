import { site } from "@/lib/site";
import { deliveredTo, displayName, testimonials } from "@/lib/testimonials";

type Props = { title?: string; eyebrow?: string };

/** Customer WhatsApp messages, recreated as chat bubbles (no screenshots, no personal details). */
export function Testimonials({ eyebrow = "What customers say", title = "Delivered. Thanked. Ordered again." }: Props) {
  return (
    <section className="section testimonials">
      <div className="sectionhead">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
        </div>
        <p>Real messages from Victors customers on WhatsApp, shared as they were sent.</p>
      </div>

      <div className="t-track">
        {testimonials.map((t) => (
          <figure key={`${t.area}-${t.messages[0].time}`} className="t-card">
            <div className="t-chat">
              <span className="t-badge">WhatsApp</span>
              {t.messages.map((m, i) => (
                <p key={i} className={`t-bubble ${m.from === "victors" ? "out" : "in"}`}>
                  {m.text}
                  <small>
                    {m.time}
                    {m.from === "victors" && " ✓✓"}
                  </small>
                </p>
              ))}
            </div>
            <blockquote className="t-translation">{t.translation}</blockquote>
            <figcaption>
              <b>{displayName(t)}</b>
              <span>
                {t.product}
                {t.date && ` · ${t.date}`}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="t-areas">
        <span>Recently delivered to</span>
        <div>
          {deliveredTo.map((a) => (
            <em key={a}>{a}</em>
          ))}
        </div>
      </div>

      <a className="t-review" href={site.googleReviewUrl} target="_blank" rel="noopener noreferrer">
        Bought from Victors? Leave us a Google review →
      </a>
    </section>
  );
}
