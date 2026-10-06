"use client";

import { useRef, useState } from "react";
import { products, type Product } from "@/lib/products";

/** Selection value for "this category, not sure which type" */
export const anyOf = (p: Product) => `any:${p.slug}`;

/** Human label for a selection value, as it appears in tags and the WhatsApp message */
export function selectionLabel(value: string) {
  const cat = products.find((p) => anyOf(p) === value);
  return cat ? `${cat.name} (not sure which type)` : value;
}

/** The category a selection belongs to */
export function selectionCategory(value: string): Product | undefined {
  return products.find((p) => anyOf(p) === value || p.variants.some((v) => v.name === value));
}

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
};

/**
 * Two-level multi-select: tap a category to reveal its types, tick one or more.
 * Opens inline with its own scroll area so it never fills the whole phone screen.
 */
export function ProductPicker({ value, onChange, invalid }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  function openList() {
    setOpen(true);
    // Bring the picker to the top so the whole list (and Done) sits above the phone's bottom tab bar
    window.setTimeout(() => root.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }
  const [expanded, setExpanded] = useState<string | null>(() => selectionCategory(value[0] ?? "")?.slug ?? null);

  function toggle(cat: Product, item: string) {
    const isAny = item === anyOf(cat);
    let next = value.includes(item) ? value.filter((v) => v !== item) : [...value, item];
    // "Not sure which type" and specific types of the same category are mutually exclusive
    if (!value.includes(item)) {
      next = isAny
        ? next.filter((v) => v === item || selectionCategory(v) !== cat)
        : next.filter((v) => v !== anyOf(cat));
    }
    onChange(next);
  }

  const countIn = (cat: Product) => value.filter((v) => selectionCategory(v) === cat).length;

  return (
    <div className={`ms${open ? " is-open" : ""}`} ref={root}>
      <button
        type="button"
        className={`ms-trigger${invalid ? " is-missing" : ""}`}
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <span>{value.length ? `${value.length} selected` : "Choose products…"}</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="ms-panel">
          <div className="ms-scroll" role="group" aria-label="Products">
            {products.map((cat) => {
              const isOpen = expanded === cat.slug;
              const n = countIn(cat);
              return (
                <div key={cat.slug} className="ms-group">
                  <button
                    type="button"
                    className="ms-cat"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : cat.slug)}
                  >
                    <span>{cat.name}</span>
                    {n > 0 && <em>{n}</em>}
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="ms-types">
                      {[{ value: anyOf(cat), label: "Not sure which type" }, ...cat.variants.map((v) => ({ value: v.name, label: v.name }))].map(
                        (o) => (
                          <label key={o.value} className={`ms-opt${value.includes(o.value) ? " on" : ""}`}>
                            <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(cat, o.value)} />
                            <span>{o.label}</span>
                          </label>
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" className="ms-done" onClick={() => setOpen(false)}>
            Done{value.length ? ` · ${value.length} selected` : ""}
          </button>
        </div>
      )}

      {value.length > 0 && (
        <div className="ms-tags">
          {value.map((v) => (
            <span key={v} className="ms-tag">
              {selectionLabel(v)}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${selectionLabel(v)}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
