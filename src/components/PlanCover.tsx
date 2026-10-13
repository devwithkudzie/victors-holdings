"use client";

import { useEffect, useRef, useState } from "react";

type Box = { x: number; y: number; w: number; h: number };
type Props = { file: File; onDone: (covered: File) => void; onCancel: () => void };

/** Longest side of the image sent for reading — enough to read small dimension text */
const MAX_SIDE = 3000;
const MAX_BYTES = 4.2 * 1024 * 1024;

/** Draws page 1 of a PDF (or the photo) onto a canvas, entirely on the customer's phone */
async function renderToCanvas(file: File, page = 1): Promise<{ canvas: HTMLCanvasElement; pages: number }> {
  const canvas = document.createElement("canvas");
  if (file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const p = await doc.getPage(Math.min(page, doc.numPages));
    const base = p.getViewport({ scale: 1 });
    const viewport = p.getViewport({ scale: MAX_SIDE / Math.max(base.width, base.height) });
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await p.render({ canvas, canvasContext: ctx, viewport }).promise;
    return { canvas, pages: doc.numPages };
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return { canvas, pages: 1 };
}

async function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  for (const quality of [0.85, 0.75, 0.65]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= MAX_BYTES) return blob;
  }
  // Still too big: shrink once
  const small = document.createElement("canvas");
  small.width = Math.round(canvas.width * 0.75);
  small.height = Math.round(canvas.height * 0.75);
  small.getContext("2d")!.drawImage(canvas, 0, 0, small.width, small.height);
  return (await new Promise<Blob | null>((r) => small.toBlob(r, "image/jpeg", 0.7)))!;
}

/**
 * Privacy step: the customer drags boxes over their name, address and stand number.
 * Those areas are blacked out before anything leaves the phone; only the covered image is uploaded.
 */
export function PlanCover({ file, onDone, onCancel }: Props) {
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [draft, setDraft] = useState<Box | null>(null);
  /** Zoom in to reach small title blocks; "move" lets the finger pan instead of drawing */
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"cover" | "move">("cover");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const view = useRef<HTMLCanvasElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let alive = true;
    setSource(null);
    setBoxes([]);
    renderToCanvas(file, page)
      .then((r) => {
        if (!alive) return;
        setSource(r.canvas);
        setPages(r.pages);
      })
      .catch(() => alive && setError("We couldn't open this file. Try a different PDF, or a photo of the plan."));
    return () => {
      alive = false;
    };
  }, [file, page]);

  // Draw the plan once; the black boxes are a light overlay so dragging stays smooth on budget phones
  useEffect(() => {
    const c = view.current;
    if (!c || !source) return;
    c.width = source.width;
    c.height = source.height;
    c.getContext("2d")!.drawImage(source, 0, 0);
  }, [source]);

  /** Pointer position in the plan's own pixels */
  const point = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = source ? source.width / r.width : 1;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sx };
  };
  const pct = (b: Box): React.CSSProperties =>
    source
      ? { left: `${(b.x / source.width) * 100}%`, top: `${(b.y / source.height) * 100}%`, width: `${(b.w / source.width) * 100}%`, height: `${(b.h / source.height) * 100}%` }
      : {};
  /** Each box grows by a small margin so near-misses still cover the text */
  const toBox = (a: { x: number; y: number }, b: { x: number; y: number }): Box => {
    const pad = source ? source.width * 0.01 : 0;
    const W = source?.width ?? Infinity;
    const H = source?.height ?? Infinity;
    const x = Math.max(0, Math.min(a.x, b.x) - pad);
    const y = Math.max(0, Math.min(a.y, b.y) - pad);
    return { x, y, w: Math.min(W, Math.max(a.x, b.x) + pad) - x, h: Math.min(H, Math.max(a.y, b.y) + pad) - y };
  };
  const changeZoom = (z: number) => {
    setZoom(z);
    setTool(z > 1 ? "move" : "cover");
  };

  async function finish() {
    if (!source) return;
    setBusy(true);
    const out = document.createElement("canvas");
    out.width = source.width;
    out.height = source.height;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(source, 0, 0);
    ctx.fillStyle = "#000";
    for (const b of boxes) ctx.fillRect(b.x, b.y, b.w, b.h);
    const blob = await toJpeg(out);
    setBusy(false);
    onDone(new File([blob], "plan-covered.jpg", { type: "image/jpeg" }));
  }

  return (
    <div className="pc">
      <div className="pc-head">
        <b>Hide your personal details</b>
        <span>
          Drag a box over your name, address and stand number. Zoom in for small text. They&apos;re blacked out on your phone before
          the plan is sent.
        </span>
        <small className="pc-count">
          {boxes.length ? `${boxes.length} area${boxes.length > 1 ? "s" : ""} covered` : "Nothing covered yet"}
          {zoom > 1 && tool === "move" ? " · Move to your name, then tap Cover" : ""}
        </small>
      </div>

      {error ? (
        <p className="bc-error">{error}</p>
      ) : !source ? (
        <div className="pc-loading">
          <span className="bc-spinner" aria-hidden />
          Opening your plan…
        </div>
      ) : (
        <div className="pc-scroll">
        <div
          className={`pc-stage${tool === "move" ? " is-move" : ""}`}
          style={{ width: `${zoom * 100}%` }}
          role="application"
          aria-label="Your plan. Drag to cover personal details."
          onPointerDown={(e) => {
              if (tool !== "cover") return;
              e.currentTarget.setPointerCapture(e.pointerId);
              start.current = point(e);
            }}
            onPointerMove={(e) => start.current && setDraft(toBox(start.current, point(e)))}
            onPointerUp={(e) => {
              if (start.current) {
                const b = toBox(start.current, point(e));
                if (b.w > 8 && b.h > 8) setBoxes((bs) => [...bs, b]);
              }
              start.current = null;
              setDraft(null);
            }}
            onPointerCancel={() => {
              start.current = null;
              setDraft(null);
            }}
        >
          <canvas ref={view} className="pc-canvas" />
          {boxes.map((b, i) => (
            <span key={i} className="pc-box" style={pct(b)} />
          ))}
          {draft && <span className="pc-box is-draft" style={pct(draft)} />}
        </div>
        </div>
      )}

      <div className="pc-tools">
        <div className="pc-seg" role="radiogroup" aria-label="Tool">
          <button type="button" role="radio" aria-checked={tool === "cover"} className={tool === "cover" ? "on" : undefined} onClick={() => setTool("cover")}>
            ⬛ Cover
          </button>
          <button type="button" role="radio" aria-checked={tool === "move"} className={tool === "move" ? "on" : undefined} onClick={() => setTool("move")} disabled={zoom === 1}>
            ✋ Move
          </button>
        </div>
        <div className="pc-zoom">
          <button type="button" onClick={() => changeZoom(Math.max(1, zoom - 1))} disabled={zoom === 1} aria-label="Zoom out">
            −
          </button>
          <span>{zoom}×</span>
          <button type="button" onClick={() => changeZoom(Math.min(3, zoom + 1))} disabled={zoom === 3} aria-label="Zoom in">
            +
          </button>
        </div>
        <button type="button" onClick={() => setBoxes((b) => b.slice(0, -1))} disabled={!boxes.length}>
          Undo
        </button>
        {pages > 1 && (
          <select value={page} onChange={(e) => setPage(Number(e.target.value))} aria-label="Page">
            {Array.from({ length: pages }, (_, i) => (
              <option key={i} value={i + 1}>
                Page {i + 1} of {pages}
              </option>
            ))}
          </select>
        )}
      </div>

      <button type="button" className="bc-primary" disabled={!source || busy} onClick={finish}>
        {busy ? "Preparing…" : boxes.length ? "Done — calculate my bricks →" : "No personal details — calculate →"}
      </button>
      <button type="button" className="bc-link" onClick={onCancel}>
        Choose a different file
      </button>
    </div>
  );
}
