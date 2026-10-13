import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { INSTRUCTIONS, PlanReadError, PlanReadingSchema, USER_PROMPT, type PlanImage, type PlanReading } from "./schema";

/** Anthropic (Claude). Key: ANTHROPIC_API_KEY · model: ANTHROPIC_MODEL (default claude-opus-5) */
export async function readWithAnthropic(plan: PlanImage): Promise<PlanReading> {
  const client = new Anthropic({ timeout: 110_000, maxRetries: 1 });
  const response = await client.beta.messages.parse({
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    // If a safety classifier ever declines, retry on Anthropic's recommended fallback model
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: INSTRUCTIONS,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: plan.type, data: plan.data.toString("base64") } },
          { type: "text", text: USER_PROMPT },
        ],
      },
    ],
    output_config: { format: betaZodOutputFormat(PlanReadingSchema) },
  });
  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new PlanReadError("Plan could not be read");
  }
  return response.parsed_output;
}
