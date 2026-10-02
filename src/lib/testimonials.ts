/**
 * Customer messages from Victors' WhatsApp chats, kept word-for-word.
 * Translations are draft — check with a Shona speaker before launch.
 *
 * Names are hidden until each customer approves being shown (SHOW_NAMES).
 * Never add phone numbers, prices or profile photos here.
 */
export const SHOW_NAMES = false;

export type Bubble = { from: "customer" | "victors"; text: string; time: string };

export type Testimonial = {
  name: string;
  area: string;
  product: string;
  date?: string;
  messages: Bubble[];
  translation: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Josh",
    area: "Kadoma",
    product: "Bricks",
    messages: [
      {
        from: "customer",
        text: "All thanks to my bricks supplier Victors Holdings delivery yasvika rambai makadaro your service is very good",
        time: "12:40",
      },
    ],
    translation: "All thanks to my bricks supplier Victors Holdings — the delivery has arrived. Keep it up, your service is very good.",
  },
  {
    name: "Gaffa",
    area: "Mt Darwin",
    product: "Bricks",
    date: "Aug 2026",
    messages: [
      { from: "customer", text: "Thank you so much. BOSS TEAM RASVIKA ZVAKANAKA TABURUTSA", time: "21:57" },
      { from: "customer", text: "Matibata zvakanaka musaperera patiri itirai vamwe saizvozvo", time: "21:58" },
    ],
    translation:
      "Thank you so much. The team arrived safely and we've offloaded. You treated us well — don't stop with us, do the same for others.",
  },
  {
    name: "Customer",
    area: "Epworth",
    product: "Bricks",
    date: "Aug 2026",
    messages: [
      { from: "customer", text: "Maita basa zvasvika zvidhina", time: "19:08" },
      { from: "victors", text: "Tinotenda zvikuru, quality yacho irisei ndiyo yamaida here", time: "19:08" },
      { from: "customer", text: "Yes ndiyoyo", time: "19:09" },
    ],
    translation: "“Thank you, the bricks have arrived.” — “Thank you! Is the quality what you wanted?” — “Yes, that's exactly it.”",
  },
  {
    name: "Paulus",
    area: "Chitungwiza",
    product: "Bricks",
    date: "Sep 2026",
    messages: [
      { from: "victors", text: "Morning Boss yakasvika here Delivery", time: "08:28" },
      { from: "customer", text: "Hongu baba, thanks a lot I catch next time", time: "08:42" },
    ],
    translation: "“Morning Boss, has the delivery arrived?” — “Yes sir, thanks a lot, I'll buy again next time.”",
  },
];

/** Areas Victors has delivered to (from customer chats) — shown as "Recently delivered to". */
export const deliveredTo = ["Harare", "Mt Hampden", "Chitungwiza", "Epworth", "Ruwa", "Kadoma", "Mt Darwin"];

export function displayName(t: Testimonial) {
  return SHOW_NAMES && t.name !== "Customer" ? `${t.name}, ${t.area}` : `Customer in ${t.area}`;
}
