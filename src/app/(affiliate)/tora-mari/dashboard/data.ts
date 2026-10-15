import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { affiliateDashboard } from "@/lib/server/affiliates";
import { readSession } from "@/lib/server/auth";

/** The signed-in affiliate's data, or a redirect to the login page */
export async function requireAffiliate() {
  const id = await readSession("affiliate");
  if (!id) redirect("/tora-mari/login");
  const data = await affiliateDashboard(id);
  if (!data) redirect("/tora-mari/login");
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  return { ...data, link: `${origin}/r/${data.affiliate.code}`, waLink: `${origin}/w/${data.affiliate.code}` };
}

export const REF_STATUS: Record<string, string> = {
  recorded: "Recorded — waiting for delivery & payment",
  delivered_paid: "Delivered & paid — payout being approved",
  approved: "Approved — payout on its way",
  paid: "Paid",
  rejected: "Not eligible",
};

export const shortDate = (d: Date) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
