/**
 * Three design variations for the client to choose from.
 * The active design is set on <html data-design="a|b|c"> and switched from the menu.
 *
 * Once the client picks one:
 *   NEXT_PUBLIC_DEFAULT_DESIGN=b      → make it the default
 *   NEXT_PUBLIC_DESIGN_PICKER=off     → hide the "Choose design" switch
 */
export const designs = [
  { id: "a", name: "Bold", blurb: "Industrial, dark, full-screen photos" },
  { id: "b", name: "App", blurb: "Clean catalogue with app-style tab bar" },
  { id: "c", name: "Premium", blurb: "Warm, editorial, floating glass menu" },
] as const;

export type DesignId = (typeof designs)[number]["id"];

const envDefault = process.env.NEXT_PUBLIC_DEFAULT_DESIGN;
export const defaultDesign: DesignId = designs.some((d) => d.id === envDefault) ? (envDefault as DesignId) : "a";

export const showDesignPicker = process.env.NEXT_PUBLIC_DESIGN_PICKER !== "off";

export const DESIGN_STORAGE_KEY = "vh-design";

/**
 * Runs before first paint: applies ?design=x from the URL (so you can send the
 * client a direct link) or the last choice saved on this device.
 */
export const designBootScript = `(function(){try{var ok=${JSON.stringify(designs.map((d) => d.id))};var q=new URLSearchParams(location.search).get("design");var s=null;try{s=localStorage.getItem("${DESIGN_STORAGE_KEY}")}catch(e){}var d=ok.indexOf(q)>-1?q:(${showDesignPicker}&&ok.indexOf(s)>-1?s:null);if(d){document.documentElement.dataset.design=d;try{localStorage.setItem("${DESIGN_STORAGE_KEY}",d)}catch(e){}}}catch(e){}})();`;
