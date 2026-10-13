import { calculateBricks, takeoffFromHouseSize } from "@/lib/bricks";
import { activeProvider, isAcceptedType, PlanReadError, readingToTakeoff, readPlan, type PlanReading } from "@/lib/plan-reader";
import { checkDailyCap, checkVisitor, clientIp, fileHash, getCached, setCached, verifyTurnstile } from "@/lib/server/protection";
import { sign, type EstimatePayload } from "@/lib/server/quote";

// Reading a plan with AI can take up to a minute or two
export const maxDuration = 120;

const MAX_BYTES = 4.4 * 1024 * 1024; // Vercel's request body limit is 4.5 MB
// Plans are converted to a covered-up image on the customer's phone, so only images arrive here

const fail = (status: number, error: string, message: string) => Response.json({ error, message }, { status });

/**
 * POST multipart/form-data  (+ turnstileToken from the bot check)
 *   mode=plan        + plan=<image>              → AI reads the plan, then we calculate
 *   mode=house-size  + floorArea + bedrooms      → rough estimate without a plan
 * Returns a signed estimate token; the numbers are revealed once the customer leaves their details.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return fail(400, "bad-request", "Please try again.");
  const ip = clientIp(req);

  // 1. Bot check (Cloudflare Turnstile) — before any work is done
  if (!(await verifyTurnstile(form.get("turnstileToken") as string | null, ip))) {
    return fail(403, "bot-check", "Please complete the security check and try again.");
  }

  const isPlan = form.get("mode") !== "house-size";
  // 2. Per-visitor limits
  const visitor = await checkVisitor(isPlan ? "plan" : "size", ip);
  if (!visitor.ok) return fail(visitor.status, visitor.error, visitor.message);

  const now = new Date().toISOString();
  let payload: EstimatePayload;

  if (!isPlan) {
    const floorArea = Number(form.get("floorArea"));
    const bedrooms = Number(form.get("bedrooms"));
    if (!(floorArea >= 20 && floorArea <= 2000) || !(bedrooms >= 0 && bedrooms <= 20)) {
      return fail(400, "invalid-size", "Enter a floor area between 20 and 2,000 m² and the number of bedrooms.");
    }
    payload = { v: 1, estimate: calculateBricks(takeoffFromHouseSize(floorArea, Math.round(bedrooms))), createdAt: now };
  } else {
    const file = form.get("plan");
    if (!(file instanceof File) || file.size === 0) return fail(400, "no-file", "Choose your plan (PDF or photo) to upload.");
    if (file.size > MAX_BYTES) return fail(413, "too-large", "That file is over 4 MB. Try a smaller PDF or a photo of the plan.");
    if (!isAcceptedType(file.type)) return fail(415, "wrong-type", "Upload a PDF, JPG or PNG of your plan.");
    if (!activeProvider()) {
      return fail(503, "plan-reading-unavailable", "Plan reading isn't available right now — enter your house size instead.");
    }

    const data = Buffer.from(await file.arrayBuffer());
    const hash = fileHash(data);
    // 3. Same image uploaded again → reuse the earlier reading (no AI cost)
    let reading = await getCached<PlanReading>(hash);
    if (!reading) {
      // 4. Site-wide daily cap on AI reads
      const cap = await checkDailyCap();
      if (!cap.ok) return fail(cap.status, cap.error, cap.message);
      try {
        reading = await readPlan({ data, type: file.type });
        await setCached(hash, reading);
      } catch (e) {
        if (e instanceof PlanReadError) return fail(422, "unreadable", "We couldn't read this plan. Try a clearer copy, or enter your house size.");
        // Provider SDK errors (Anthropic, OpenAI, Gemini) all carry an HTTP status
        const status = (e as { status?: number }).status;
        if (status === 429) return fail(429, "busy", "We're busy right now — please try again in a minute.");
        console.error("[bricks] plan reading failed", status ?? "", e instanceof Error ? e.message : e);
        return fail(502, "ai-error", "Something went wrong reading your plan. Please try again, or enter your house size.");
      }
    }
    if (!reading.is_house_plan || reading.external_wall_length_m <= 0) {
      return fail(422, "not-a-plan", reading.unreadable_reason || "We couldn't find wall measurements on this file. Try a clearer copy, or enter your house size.");
    }
    payload = { v: 1, estimate: calculateBricks(readingToTakeoff(reading)), planName: file.name, createdAt: now };
  }

  return Response.json({
    token: sign(payload),
    source: payload.estimate.source,
    confidence: payload.estimate.confidence,
  });
}
