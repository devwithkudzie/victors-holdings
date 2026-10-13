const icon = (d: string) => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden>
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ITEMS = [
  {
    title: "Nationwide delivery",
    text: "Delivered anywhere in Zimbabwe",
    icon: icon("M2 7h11v9H2zM13 10h4l4 3v3h-8M5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"),
  },
  {
    title: "Special offers",
    text: "Regular sales and discounts",
    icon: icon("M3 12V4h8l10 10-8 8L3 12ZM7.5 8.5h.01"),
  },
  {
    title: "Payment on delivery",
    text: "Pay when your order arrives",
    icon: icon("M2 6h20v12H2zM2 10h20M6 15h4"),
  },
  {
    title: "Wholesale prices",
    text: "Talk to a real person on WhatsApp",
    icon: icon("M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z"),
  },
];

/**
 * Strip of key selling points at the top of the homepage hero.
 * Desktop: four columns. Phones: scrolls automatically (pauses on touch; still for reduced motion).
 */
export function BenefitBar() {
  const row = (hidden: boolean) =>
    ITEMS.map((i) => (
      <div key={i.title + hidden} className="bb-item" aria-hidden={hidden || undefined}>
        {i.icon}
        <span>
          <b>{i.title}</b>
          <small>{i.text}</small>
        </span>
      </div>
    ));
  return (
    <div className="bb" role="region" aria-label="Why buy from Victors">
      <div className="bb-track">
        {row(false)}
        {/* second copy makes the phone scroll loop seamlessly */}
        {row(true)}
      </div>
    </div>
  );
}
