import { index, integer, jsonb, numeric, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/** Tora Mari affiliates */
export const affiliates = pgTable(
  "affiliates",
  {
    id: serial("id").primaryKey(),
    /** Referral code, e.g. TENDAI20 — used in /r/CODE links and "Ref: CODE" messages */
    code: text("code").notNull(),
    name: text("name").notNull(),
    /** WhatsApp number, international digits (2637…) — also the login */
    phone: text("phone").notNull(),
    area: text("area").notNull(),
    payoutMethod: text("payout_method", { enum: ["ecocash", "bank"] }).notNull(),
    payoutDetails: text("payout_details").notNull(),
    /** Hashed login password (column kept as pin_hash so no database migration is needed) */
    passwordHash: text("pin_hash").notNull(),
    status: text("status", { enum: ["active", "paused"] }).notNull().default("active"),
    rulesVersion: text("rules_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("affiliates_code_idx").on(t.code), uniqueIndex("affiliates_phone_idx").on(t.phone)],
);

/** Every visit through a referral link */
export const clicks = pgTable(
  "clicks",
  {
    id: serial("id").primaryKey(),
    affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    landing: text("landing").notNull(),
    device: text("device"),
    city: text("city"),
  },
  (t) => [index("clicks_affiliate_idx").on(t.affiliateId)],
);

/** Quote requests sent from the website while a referral code was saved */
export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    source: text("source").notNull(),
    summary: text("summary").notNull(),
  },
  (t) => [index("leads_affiliate_idx").on(t.affiliateId)],
);

/** Orders attached to an affiliate by the sales team */
export const referrals = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
    customerPhone: text("customer_phone").notNull(),
    customerArea: text("customer_area").notNull(),
    description: text("description").notNull(),
    orderValue: numeric("order_value", { precision: 12, scale: 2 }).notNull(),
    /** recorded → delivered & paid → approved → paid (or rejected) */
    status: text("status", { enum: ["recorded", "delivered_paid", "approved", "paid", "rejected"] }).notNull().default("recorded"),
    note: text("note"),
    customerPaidAt: timestamp("customer_paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: integer("created_by").references(() => staff.id),
  },
  (t) => [index("referrals_affiliate_idx").on(t.affiliateId), index("referrals_customer_idx").on(t.customerPhone)],
);

/** Money paid to affiliates — one payout per referral */
export const payouts = pgTable(
  "payouts",
  {
    id: serial("id").primaryKey(),
    referralId: integer("referral_id").notNull().references(() => referrals.id),
    affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    method: text("method").notNull(),
    reference: text("reference").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
    paidBy: integer("paid_by").references(() => staff.id),
  },
  (t) => [uniqueIndex("payouts_referral_idx").on(t.referralId)],
);

/** Victors staff who can use /admin */
export const staff = pgTable(
  "staff",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin", "sales"] }).notNull().default("sales"),
    active: integer("active").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("staff_email_idx").on(t.email)],
);

/** Who changed what — important when money and disputes are involved */
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  staffId: integer("staff_id").references(() => staff.id),
  action: text("action").notNull(),
  detail: jsonb("detail"),
});
