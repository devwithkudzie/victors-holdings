/**
 * Normalises a Zimbabwean mobile number to international digits (2637XXXXXXXX).
 * Accepts 077 123 4567, +263 77 123 4567, 263771234567, 77 123 4567. Returns null if invalid.
 */
export function normaliseZimMobile(input: string): string | null {
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("263")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return /^7[1-9]\d{7}$/.test(d) ? `263${d}` : null;
}

/** 263771234567 → +263 77 123 4567 */
export const formatZimMobile = (n: string) => `+${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
