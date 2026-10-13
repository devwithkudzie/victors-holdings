import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { INSTRUCTIONS, PlanReadError, PlanReadingSchema, USER_PROMPT, type PlanImage, type PlanReading } from "./schema";

/**
 * Google Gemini. Key: GEMINI_API_KEY · model: GEMINI_MODEL (default gemini-3.1-pro-preview)
 * Use a PAID Gemini API project: on the free tier Google may use submitted content to improve its products.
 */
export async function readWithGemini(plan: PlanImage): Promise<PlanReading> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.1-pro-preview",
    contents: [
      {
        role: "user",
        parts: [{ inlineData: { mimeType: plan.type, data: plan.data.toString("base64") } }, { text: USER_PROMPT }],
      },
    ],
    config: {
      systemInstruction: INSTRUCTIONS,
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(PlanReadingSchema),
      abortSignal: AbortSignal.timeout(110_000),
    },
  });
  const parsed = PlanReadingSchema.safeParse(safeJson(response.text));
  if (!parsed.success) throw new PlanReadError("Plan could not be read");
  return parsed.data;
}

function safeJson(text: string | undefined) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
