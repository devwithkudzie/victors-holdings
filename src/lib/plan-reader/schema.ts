import { z } from "zod";
import type { WallTakeoff } from "../bricks";

/**
 * What the AI reads off the plan — measurements only. There are deliberately no fields
 * for names, addresses or stand numbers, so personal details can't come back even if visible.
 */
const OpeningSchema = z.object({
  width_m: z.number(),
  height_m: z.number(),
  count: z.number(),
  location: z.enum(["external", "internal"]),
});

export const PlanReadingSchema = z.object({
  is_house_plan: z.boolean(),
  unreadable_reason: z.string().nullable(),
  storeys: z.number(),
  floor_area_m2: z.number().nullable(),
  external_wall_length_m: z.number(),
  external_wall_thickness_mm: z.number(),
  internal_wall_230_length_m: z.number(),
  internal_wall_115_length_m: z.number(),
  wall_height_m: z.number().nullable(),
  foundation_depth_m: z.number().nullable(),
  floor_level_above_ground_m: z.number().nullable(),
  windows: z.array(OpeningSchema),
  doors: z.array(OpeningSchema),
  confidence: z.enum(["high", "medium", "low"]),
  notes: z.array(z.string()),
});

export type PlanReading = z.infer<typeof PlanReadingSchema>;

/** Same instructions for every provider, so results are comparable */
export const INSTRUCTIONS = `You are a quantity surveyor's assistant reading an architectural house plan from Zimbabwe so that a brick supplier can estimate how many bricks the walls need. Your job is to read measurements, not to count bricks.

Read the plan carefully, using the dimension strings (usually in millimetres) rather than estimating from the drawing. Report:
- external_wall_length_m: total centre-line length of all external walls, following angled corners and recesses.
- external_wall_thickness_mm: usually 230 for double-brick external walls.
- internal_wall_230_length_m and internal_wall_115_length_m: total length of internal walls of each thickness. Count each wall once.
- wall_height_m: floor to wall plate, from the section if shown; otherwise null.
- foundation_depth_m: depth of foundation brickwork below natural ground level, from the section or notes; otherwise null.
- floor_level_above_ground_m: floor or DPC level above natural ground level, from the section or notes; otherwise null.
- windows and doors: group identical openings and give width, height and count. Mark each door as external or internal. Use sizes from the plan's schedule or labels; where none are given, use typical sizes (windows about 1.2 × 1.2 m, external doors 0.9 × 2.1 m, internal doors 0.8 × 2.1 m) and say so in notes.
- floor_area_m2: if the plan states it.
- storeys: number of storeys.
- confidence: high only if the dimensions are clearly legible and complete; low if you had to guess major lengths.
- notes: short, plain-English assumptions a customer would understand (e.g. "Internal wall thicknesses not labelled; 115 mm assumed for partition walls."). At most 6.

Privacy: some areas of the plan may be blacked out by the customer. Ignore any owner names, addresses, stand numbers, phone numbers or designer details, and never mention them in your notes.

If the image is not an architectural house plan, or is too blurry to read any dimensions, set is_house_plan accordingly, explain in unreadable_reason, and return zeros for the lengths.`;

export const USER_PROMPT = "Read the wall measurements from this plan.";

/** Plans arrive as a covered-up image made on the customer's phone */
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedType = (typeof ACCEPTED_TYPES)[number];
export const isAcceptedType = (t: string): t is AcceptedType => (ACCEPTED_TYPES as readonly string[]).includes(t);

export type PlanImage = { data: Buffer; type: AcceptedType };

/** The plan couldn't be read (declined, cut off or unparseable) — the customer is offered other options */
export class PlanReadError extends Error {}

/** Converts the AI's reading into the calculator's input */
export function readingToTakeoff(r: PlanReading): WallTakeoff {
  const notes = [...r.notes];
  if (r.storeys > 1) notes.unshift(`This plan shows ${r.storeys} storeys — the estimate covers the floor shown; ask Victors to check upper floors.`);
  return {
    externalWallLength: r.external_wall_length_m,
    externalWallThicknessMm: r.external_wall_thickness_mm || 230,
    internalWall230Length: r.internal_wall_230_length_m,
    internalWall115Length: r.internal_wall_115_length_m,
    wallHeight: r.wall_height_m,
    foundationDepth: r.foundation_depth_m,
    dpcHeight: r.floor_level_above_ground_m,
    windows: r.windows,
    doors: r.doors,
    floorArea: r.floor_area_m2,
    confidence: r.confidence,
    notes,
    source: "plan",
  };
}
