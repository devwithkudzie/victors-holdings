import type { Metadata } from "next";
import { BrickCalculator } from "@/components/BrickCalculator";
import { activeProvider } from "@/lib/plan-reader";
import { autoSendEnabled } from "@/lib/server/leads";
import { quotableBricks } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Free brick calculator — upload your house plan",
  description:
    "Upload your house plan and get an estimate of how many bricks you need, plus a quotation from Victors Holdings, Mt Hampden, Harare.",
  alternates: { canonical: "/brick-calculator" },
};

// Reads env (auto-send availability) at request time
export const dynamic = "force-dynamic";

export default function BrickCalculatorPage() {
  return <BrickCalculator bricks={quotableBricks().map((b) => b.name)} autoSend={autoSendEnabled()} planReader={activeProvider()?.label ?? null} />;
}
