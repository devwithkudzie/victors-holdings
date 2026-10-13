/**
 * Brick quantity calculator — plain arithmetic, no AI.
 * The AI only reads measurements off the plan; every number below is calculated here
 * so it is consistent, explainable and easy to adjust.
 */

/** Standard Zimbabwean common brick (mm) and mortar joint (mm) */
export const BRICK = { length: 222, height: 73, joint: 10 };

/** Bricks per m² for one skin (a half-brick, 115mm wall): 1 / ((0.222+0.010) × (0.073+0.010)) ≈ 52 */
export const BRICKS_PER_M2_PER_SKIN = 1 / (((BRICK.length + BRICK.joint) / 1000) * ((BRICK.height + BRICK.joint) / 1000));

export const DEFAULTS = {
  /** Floor to wall plate when the plan doesn't say */
  wallHeight: 2.7,
  /** Foundation brickwork below natural ground level */
  foundationDepth: 0.6,
  /** Floor/DPC level above natural ground level */
  dpcHeight: 0.3,
  window: { width: 1.2, height: 1.2 },
  externalDoor: { width: 0.9, height: 2.1 },
  internalDoor: { width: 0.8, height: 2.1 },
  /** Breakages and cutting */
  wastage: 0.05,
};

export type Opening = { width_m: number; height_m: number; count: number; location?: "external" | "internal" };

/** Measurements taken from a plan (by the AI) or estimated from the house size */
export type WallTakeoff = {
  externalWallLength: number;
  externalWallThicknessMm: number;
  internalWall230Length: number;
  internalWall115Length: number;
  wallHeight: number | null;
  foundationDepth: number | null;
  dpcHeight: number | null;
  windows: Opening[];
  doors: Opening[];
  floorArea: number | null;
  confidence: "high" | "medium" | "low";
  notes: string[];
  source: "plan" | "house-size";
};

export type BrickLine = { label: string; area: number; skins: number; bricks: number };

export type BrickEstimate = {
  lines: BrickLine[];
  subtotal: number;
  wastage: number;
  total: number;
  range: [number, number];
  assumptions: string[];
  confidence: WallTakeoff["confidence"];
  floorArea: number | null;
  source: WallTakeoff["source"];
};

const skinsFor = (thicknessMm: number) => (thicknessMm >= 200 ? 2 : 1);
const openingArea = (list: Opening[]) => list.reduce((sum, o) => sum + o.width_m * o.height_m * o.count, 0);
const roundUp = (n: number, to: number) => Math.ceil(n / to) * to;

export function calculateBricks(t: WallTakeoff): BrickEstimate {
  const assumptions: string[] = [];
  const wallHeight = t.wallHeight ?? DEFAULTS.wallHeight;
  if (t.wallHeight == null) assumptions.push(`Wall height of ${DEFAULTS.wallHeight} m (floor to wall plate) assumed.`);
  const foundationDepth = t.foundationDepth ?? DEFAULTS.foundationDepth;
  if (t.foundationDepth == null) assumptions.push(`Foundation brickwork ${DEFAULTS.foundationDepth} m below ground assumed.`);
  const dpcHeight = t.dpcHeight ?? DEFAULTS.dpcHeight;
  if (t.dpcHeight == null) assumptions.push(`Floor level ${DEFAULTS.dpcHeight} m above ground assumed.`);
  const belowFloor = foundationDepth + dpcHeight;

  const externalOpenings =
    openingArea(t.windows) + openingArea(t.doors.filter((d) => (d.location ?? "external") === "external"));
  const internalDoorArea = openingArea(t.doors.filter((d) => d.location === "internal"));

  const lines: BrickLine[] = [];
  const add = (label: string, area: number, skins: number) => {
    if (area <= 0) return;
    lines.push({ label, area, skins, bricks: Math.round(area * skins * BRICKS_PER_M2_PER_SKIN) });
  };

  const extSkins = skinsFor(t.externalWallThicknessMm);
  add(`External walls above floor (${t.externalWallThicknessMm} mm)`, t.externalWallLength * wallHeight - externalOpenings, extSkins);
  add(`External wall foundations (${t.externalWallThicknessMm} mm)`, t.externalWallLength * belowFloor, extSkins);

  // Internal doors are taken out of the internal walls, half-brick walls first
  const int115Area = t.internalWall115Length * wallHeight;
  const doorsFrom115 = Math.min(internalDoorArea, int115Area);
  add("Internal walls above floor (230 mm)", t.internalWall230Length * wallHeight - (internalDoorArea - doorsFrom115), 2);
  add("Internal walls above floor (115 mm)", int115Area - doorsFrom115, 1);
  add("Internal wall foundations", t.internalWall230Length * belowFloor, 2);
  add("Partition wall foundations (115 mm)", t.internalWall115Length * belowFloor, 1);

  const subtotal = lines.reduce((s, l) => s + l.bricks, 0);
  const wastage = Math.round(subtotal * DEFAULTS.wastage);
  const total = roundUp(subtotal + wastage, 100);
  const spread = t.confidence === "high" ? 0.05 : t.confidence === "medium" ? 0.1 : 0.15;
  assumptions.push(`${Math.round(DEFAULTS.wastage * 100)}% added for breakages and cutting.`);
  assumptions.push(
    `Standard ${BRICK.length}×106×${BRICK.height} mm bricks with ${BRICK.joint} mm joints (about ${Math.round(BRICKS_PER_M2_PER_SKIN)} bricks per m² per brick layer).`,
  );

  return {
    lines,
    subtotal,
    wastage,
    total,
    range: [roundUp(total * (1 - spread), 500), roundUp(total * (1 + spread), 500)],
    assumptions: [...assumptions, ...t.notes],
    confidence: t.confidence,
    floorArea: t.floorArea,
    source: t.source,
  };
}

/**
 * Rough take-off when the customer has no plan: single-storey house from floor area and bedrooms.
 * Assumes a rectangular footprint about 1.8 times as long as it is wide.
 */
export function takeoffFromHouseSize(floorArea: number, bedrooms: number): WallTakeoff {
  const width = Math.sqrt(floorArea / 1.8);
  const perimeter = 2 * (width + width * 1.8);
  const internal = floorArea * 0.26; // typical internal wall length per m² of a Zimbabwean family house
  return {
    externalWallLength: Math.round(perimeter * 10) / 10,
    externalWallThicknessMm: 230,
    internalWall230Length: Math.round(internal * 0.4 * 10) / 10,
    internalWall115Length: Math.round(internal * 0.6 * 10) / 10,
    wallHeight: null,
    foundationDepth: null,
    dpcHeight: null,
    windows: [{ ...toOpening(DEFAULTS.window), count: bedrooms + 4 }],
    doors: [
      { ...toOpening(DEFAULTS.externalDoor), count: 2, location: "external" },
      { ...toOpening(DEFAULTS.internalDoor), count: bedrooms + 3, location: "internal" },
    ],
    floorArea,
    confidence: "low",
    notes: [
      `Estimated from a ${floorArea} m² single-storey house with ${bedrooms} bedrooms — upload your plan for a closer figure.`,
      "Double-brick (230 mm) outside walls assumed.",
    ],
    source: "house-size",
  };
}

function toOpening(o: { width: number; height: number }) {
  return { width_m: o.width, height_m: o.height };
}
