"use client";

import { useSyncExternalStore } from "react";
import { DESIGN_STORAGE_KEY, defaultDesign, type DesignId } from "./designs";

const EVENT = "vh-design-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function read(): DesignId {
  return (document.documentElement.dataset.design as DesignId) || defaultDesign;
}

export function setDesign(id: DesignId) {
  document.documentElement.dataset.design = id;
  try {
    localStorage.setItem(DESIGN_STORAGE_KEY, id);
  } catch {}
  const url = new URL(window.location.href);
  url.searchParams.set("design", id);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(EVENT));
}

export function useDesign() {
  return useSyncExternalStore(subscribe, read, () => defaultDesign);
}
