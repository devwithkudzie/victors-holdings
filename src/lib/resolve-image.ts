import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/** Finds /images/<name>.<ext> in /public, whichever extension exists. Server-only. */
export function resolveImage(name: string) {
  for (const ext of EXTENSIONS) {
    const file = `/images/${name}${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", file))) return file;
  }
}
