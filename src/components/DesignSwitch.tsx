"use client";

import { designs, showDesignPicker } from "@/lib/designs";
import { setDesign, useDesign } from "@/lib/useDesign";

/** "Choose design" control shown inside each variation's menu. */
export function DesignSwitch({ compact = false }: { compact?: boolean }) {
  const active = useDesign();
  if (!showDesignPicker) return null;

  return (
    <div className={`design-switch${compact ? " compact" : ""}`} role="radiogroup" aria-label="Choose website design">
      {!compact && <span className="design-switch-label">Choose design</span>}
      <div className="design-switch-options">
        {designs.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={active === d.id}
            className={active === d.id ? "on" : undefined}
            onClick={() => setDesign(d.id)}
            title={d.blurb}
          >
            <b>{d.id.toUpperCase()}</b>
            {!compact && <span>{d.name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
