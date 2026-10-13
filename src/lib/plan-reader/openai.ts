import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { INSTRUCTIONS, PlanReadError, PlanReadingSchema, USER_PROMPT, type PlanImage, type PlanReading } from "./schema";

/** OpenAI. Key: OPENAI_API_KEY · model: OPENAI_MODEL (default gpt-5.5) */
export async function readWithOpenAI(plan: PlanImage): Promise<PlanReading> {
  const client = new OpenAI({ timeout: 110_000, maxRetries: 1 });
  const response = await client.responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-5.5",
    instructions: INSTRUCTIONS,
    input: [
      {
        role: "user",
        content: [
          { type: "input_image", image_url: `data:${plan.type};base64,${plan.data.toString("base64")}`, detail: "high" },
          { type: "input_text", text: USER_PROMPT },
        ],
      },
    ],
    text: { format: zodTextFormat(PlanReadingSchema, "plan_reading") },
  });
  if (!response.output_parsed) throw new PlanReadError("Plan could not be read");
  return response.output_parsed;
}
