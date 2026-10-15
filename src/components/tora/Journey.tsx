/** Affiliate journey: conversion funnel + daily link clicks (single series, no legend needed) */

type Step = { label: string; value: number; hint: string };

export function Funnel({ clicks, quotes, orders, paid }: { clicks: number; quotes: number; orders: number; paid: number }) {
  const steps: Step[] = [
    { label: "Link clicks", value: clicks, hint: "people who opened your link or scanned your QR" },
    { label: "Contacted Victors", value: quotes, hint: "asked for a quote or started a WhatsApp chat" },
    { label: "Orders", value: orders, hint: "orders recorded with your code" },
    { label: "Paid to you", value: paid, hint: "referrals paid US$20" },
  ];
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ol className="jf">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.label}>
            <div className="jf-row">
              <span className="jf-label">{s.label}</span>
              <b className="jf-value">{s.value.toLocaleString("en-US")}</b>
            </div>
            <div className="jf-track" aria-hidden>
              <span className="jf-bar" style={{ width: `${Math.max(s.value ? 3 : 0, (s.value / max) * 100)}%` }} />
            </div>
            <small className="jf-hint">
              {s.hint}
              {/* Orders can exceed quote requests (some customers order straight on WhatsApp), so only show sensible rates */}
              {rate !== null && prev && rate <= 100 ? ` · ${rate}% of ${steps[i - 1].label.toLowerCase()}` : ""}
            </small>
          </li>
        );
      })}
    </ol>
  );
}

const DAY = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Bar chart of link clicks per day; each bar shows its numbers on hover/tap */
export function DailyClicks({ clicks, quotes, days = 14 }: { clicks: Date[]; quotes: Date[]; days?: number }) {
  const today = new Date();
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * DAY);
    const k = dayKey(d);
    return {
      k,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
      clicks: clicks.filter((c) => dayKey(new Date(c)) === k).length,
      quotes: quotes.filter((c) => dayKey(new Date(c)) === k).length,
    };
  });
  const max = Math.max(1, ...series.map((s) => s.clicks));
  const total = series.reduce((n, s) => n + s.clicks, 0);
  const totalQuotes = series.reduce((n, s) => n + s.quotes, 0);
  const ticks = [max, Math.round(max / 2), 0].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <figure className="jc">
      <figcaption className="jc-cap">
        <b>{total}</b> link click{total === 1 ? "" : "s"} · <b>{totalQuotes}</b> quote request{totalQuotes === 1 ? "" : "s"} in the last {days} days
      </figcaption>
      <div className="jc-plot">
        <div className="jc-axis" aria-hidden>
          {ticks.map((t) => (
            <span key={t} style={{ bottom: `${(t / max) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="jc-bars" role="list">
          {series.map((s) => (
            <div key={s.k} className="jc-col" role="listitem" tabIndex={0} aria-label={`${s.label}: ${s.clicks} clicks, ${s.quotes} quote requests`}>
              <span className="jc-bar" style={{ height: `${(s.clicks / max) * 100}%` }} />
              <span className="jc-tip">
                <b>{s.label}</b>
                {s.clicks} click{s.clicks === 1 ? "" : "s"}
                <br />
                {s.quotes} quote request{s.quotes === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="jc-x" aria-hidden>
        {series.map((s, i) => (
          <span key={s.k}>{i % 2 === (days - 1) % 2 ? s.label.split(" ")[0] : ""}</span>
        ))}
      </div>
      <details className="jc-table">
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Clicks</th>
              <th>Quote requests</th>
            </tr>
          </thead>
          <tbody>
            {[...series].reverse().map((s) => (
              <tr key={s.k}>
                <td>
                  {s.weekday} {s.label}
                </td>
                <td>{s.clicks}</td>
                <td>{s.quotes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
