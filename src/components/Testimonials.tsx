import { site } from "@/lib/site";
import { deliveredTo, displayName, testimonials } from "@/lib/testimonials";

type Props = { title?: string; eyebrow?: string };

const Ticks = () => (
  <svg className="t-ticks" viewBox="0 0 16 11" width="16" height="11" aria-label="Read">
    <path d="M11.07.65 10.4.12a.36.36 0 0 0-.5.07L4.6 6.98 2.04 4.6a.36.36 0 0 0-.5.02l-.6.64a.36.36 0 0 0 .02.5l3.27 3.06c.15.14.39.13.52-.04l6.37-7.92a.36.36 0 0 0-.05-.5Z" fill="currentColor" />
    <path d="M15.07.65 14.4.12a.36.36 0 0 0-.5.07L8.6 6.98l-.6-.56-.97 1.2 1.33 1.24c.15.14.39.13.52-.04l6.37-7.92a.36.36 0 0 0-.05-.5Z" fill="currentColor" />
  </svg>
);

/** Customer WhatsApp messages, recreated in WhatsApp's dark theme (no screenshots, no personal details). */
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
            <figcaption className="t-head">
              <svg className="t-back" viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                <path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z" fill="currentColor" />
              </svg>
              <span className="t-avatar" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" fill="currentColor" />
                </svg>
              </span>
              <span className="t-who">
                <b>{displayName(t)}</b>
                <small>{t.product}</small>
              </span>
            </figcaption>

            <div className="t-chat">
              {t.date && <span className="t-date">{t.date}</span>}
              {t.messages.map((m, i) => {
                const tail = i === 0 || t.messages[i - 1].from !== m.from;
                return (
                  <p key={i} className={`t-bubble ${m.from === "victors" ? "out" : "in"}${tail ? " tail" : ""}`}>
                    {m.text}
                    <span className="t-meta">
                      {m.time}
                      {m.from === "victors" && <Ticks />}
                    </span>
                  </p>
                );
              })}
            </div>

            <blockquote className="t-translation">
              <span>Translated</span>
              {t.translation}
            </blockquote>
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
