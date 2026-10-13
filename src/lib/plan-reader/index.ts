import "server-only";
import { readWithAnthropic } from "./anthropic";
import { readWithGemini } from "./gemini";
import { readWithOpenAI } from "./openai";
import type { PlanImage, PlanReading } from "./schema";

export * from "./schema";

/**
 * Plan reading can use Anthropic, OpenAI or Google Gemini — whichever Victors prefers.
 * Set PLAN_READER_PROVIDER=anthropic | openai | gemini plus that provider's API key.
 * If PLAN_READER_PROVIDER isn't set, the first provider with a key is used.
 */
const providers = {
  anthropic: { label: "Anthropic (Claude)", key: () => process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN, read: readWithAnthropic },
  openai: { label: "OpenAI", key: () => process.env.OPENAI_API_KEY, read: readWithOpenAI },
  gemini: { label: "Google (Gemini)", key: () => process.env.GEMINI_API_KEY, read: readWithGemini },
} satisfies Record<string, { label: string; key: () => string | undefined; read: (p: PlanImage) => Promise<PlanReading> }>;

type ProviderName = keyof typeof providers;

export function activeProvider() {
  const chosen = process.env.PLAN_READER_PROVIDER?.toLowerCase() as ProviderName | undefined;
  if (chosen) {
    const p = providers[chosen];
    if (!p) console.error(`[plan-reader] Unknown PLAN_READER_PROVIDER "${chosen}"`);
    return p?.key() ? { name: chosen, ...p } : null;
  }
  const name = (Object.keys(providers) as ProviderName[]).find((n) => providers[n].key());
  return name ? { name, ...providers[name] } : null;
}

export async function readPlan(plan: PlanImage): Promise<PlanReading> {
  const provider = activeProvider();
  if (!provider) throw new Error("No plan-reading provider configured");
  return provider.read(plan);
}
