import { cookies } from "next/headers";
import { recordLead, REF_COOKIE } from "@/lib/server/affiliates";

/** Called when a visitor with a saved referral code sends a quote request */
export async function POST(req: Request) {
  const code = (await cookies()).get(REF_COOKIE)?.value;
  if (!code) return new Response(null, { status: 204 });
  const body = await req.json().catch(() => ({}));
  try {
    await recordLead(code, String(body.source ?? "website").slice(0, 60), String(body.summary ?? ""));
  } catch (e) {
    console.error("[tora-mari] lead not recorded", e);
  }
  return new Response(null, { status: 204 });
}
