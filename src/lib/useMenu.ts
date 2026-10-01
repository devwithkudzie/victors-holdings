"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Open/close state for a mobile menu: locks page scroll, closes on Escape and on navigation. */
export function useMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, toggle: () => setOpen((o) => !o), close: () => setOpen(false), pathname };
}

export type MenuProduct = { slug: string; name: string; img?: string };
