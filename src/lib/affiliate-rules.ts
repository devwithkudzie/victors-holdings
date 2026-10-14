/**
 * Tora Mari rules — DRAFT based on the suggested answers in the affiliate plan.
 * Victors to confirm. When rules change: update RULES_VERSION and give affiliates 30 days' notice.
 */
export const RULES_VERSION = "Draft — 14 October 2026";

export const PROGRAMME = {
  name: "Tora Mari",
  reward: 20,
  currency: "US$",
  minOrderBricks: 5000,
  minOrderValue: 300,
  linkDays: 60,
  payoutDays: 7,
  disputeDays: 30,
  /** Who answers affiliate questions (WhatsApp) */
  contactName: "Victors Holdings sales team",
};

export const RULES: { title: string; text: string }[] = [
  {
    title: "What earns US$20",
    text: `A new customer's first order that is delivered and fully paid, of at least ${PROGRAMME.minOrderBricks.toLocaleString("en-US")} bricks or US$${PROGRAMME.minOrderValue}.`,
  },
  {
    title: "How long your link counts",
    text: `${PROGRAMME.linkDays} days from the customer's click. If two affiliates refer the same customer, the most recent referral counts.`,
  },
  {
    title: "When you're paid",
    text: `By EcoCash or bank transfer within ${PROGRAMME.payoutDays} days of the customer's payment. You receive the payment reference every time, and it shows on your dashboard.`,
  },
  {
    title: "Missed a referral?",
    text: `Claim it within ${PROGRAMME.disputeDays} days. We check the WhatsApp chat and order log and reply within 2 working days.`,
  },
  { title: "Who can't earn", text: "Victors staff, and anyone referring their own order." },
  { title: "No monthly cap", text: "Refer as many customers as you like." },
  { title: "Changes", text: "Any change to these rules is announced 30 days before it applies." },
];
