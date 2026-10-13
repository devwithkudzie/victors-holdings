"use client";

import { useEffect, useRef, useState } from "react";
import { trackLead } from "@/lib/analytics";
import type { Quote } from "@/lib/server/quote";
import { PlanCover } from "./PlanCover";
import { Turnstile, TURNSTILE_SITE_KEY } from "./Turnstile";
import { WhatsAppButton } from "./WhatsAppButton";

type Step = "start" | "cover" | "analysing" | "details" | "result";
/** planReader: the AI provider's name, or null when plan reading isn't set up (house size only) */
type Props = { bricks: string[]; autoSend: boolean; planReader: string | null };

const CUSTOMER_TYPES = ["Builder", "Contractor", "Building my own home"] as const;
const PROGRESS = ["Reading your plan…", "Finding the dimensions…", "Measuring the walls…", "Taking off windows and doors…", "Working out your bricks…"];

const fmt = (n: number) => n.toLocaleString("en-US");
const money = (q: Quote, n: number) => `${q.currency}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function BrickCalculator({ bricks, autoSend, planReader }: Props) {
  const [step, setStep] = useState<Step>("start");
  const [mode, setMode] = useState<"plan" | "house-size">(planReader ? "plan" : "house-size");
  const [planConsent, setPlanConsent] = useState(false);
  /** Bot-check token (single-use) and a counter to request a fresh one */
  const [botToken, setBotToken] = useState<string | null>(null);
  const [botReset, setBotReset] = useState(0);
  /** Hidden trap field — only bots fill it in */
  const [website, setWebsite] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [floorArea, setFloorArea] = useState("");
  const [bedrooms, setBedrooms] = useState("3");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [progress, setProgress] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [product, setProduct] = useState(bricks[0] ?? "");
  const [consent, setConsent] = useState(false);
  const [sendToWhatsApp, setSendToWhatsApp] = useState(true);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ quote: Quote; pdfUrl: string; autoSentToCustomer: boolean } | null>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step !== "analysing") return;
    setProgress(0);
    const t = window.setInterval(() => setProgress((p) => Math.min(p + 1, PROGRESS.length - 1)), 6000);
    return () => window.clearInterval(t);
  }, [step]);

  // Braces matter: newer browsers return a Promise from scrollIntoView, and an effect must not return one
  useEffect(() => {
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  async function analyse(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (TURNSTILE_SITE_KEY && !botToken) return setError("Please wait a moment for the security check, then try again.");
    if (mode === "plan") {
      if (!file) return setError("Choose your plan (PDF or photo) to upload.");
      if (!planConsent) return setError("Please tick the box to agree to your plan being read.");
      setStep("cover"); // personal details are covered on the phone first
      return;
    }
    if (!Number(floorArea)) return setError("Enter the floor area of the house in m².");
    const form = new FormData();
    form.set("mode", "house-size");
    form.set("floorArea", floorArea);
    form.set("bedrooms", bedrooms);
    await requestEstimate(form);
  }

  /** Called with the covered-up image from the privacy step */
  async function sendCoveredPlan(covered: File) {
    const form = new FormData();
    form.set("mode", "plan");
    form.set("plan", covered);
    await requestEstimate(form);
  }

  async function requestEstimate(form: FormData) {
    if (botToken) form.set("turnstileToken", botToken);
    setStep("analysing");
    try {
      const res = await fetch("/api/bricks/estimate", { method: "POST", body: form });
      const data = await res.json().catch(() => ({ message: "Something went wrong on our side. Please try again." }));
      if (!res.ok) {
        setError(data.message ?? "Something went wrong. Please try again.");
        if (data.error === "plan-reading-unavailable") setMode("house-size");
        setStep("start");
        return;
      }
      setToken(data.token);
      setStep("details");
    } catch {
      setError("Couldn't connect. Check your internet connection and try again.");
      setStep("start");
    } finally {
      setBotReset((n) => n + 1); // bot-check tokens are single-use
    }
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    if (!consent) return setFieldError({ field: "consent", message: "Please tick the box so we can send your quotation." });
    setBusy(true);
    try {
      const res = await fetch("/api/bricks/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, phone, customerType, product, consent, sendToWhatsApp: autoSend && sendToWhatsApp, website }),
      });
      const data = await res.json().catch(() => ({ field: "form", message: "Something went wrong on our side. Please try again." }));
      if (!res.ok) {
        setFieldError({ field: data.field ?? "form", message: data.message ?? "Please try again." });
        return;
      }
      setResult(data);
      setStep("result");
      trackLead("brick_calculator", {
        product,
        quantity: data.quote.quantity,
        customer_type: customerType,
        source_type: data.quote.estimate.source,
      });
    } catch {
      setFieldError({ field: "form", message: "Couldn't connect. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  function restart() {
    setStep("start");
    setFile(null);
    setToken("");
    setResult(null);
    setError("");
  }

  const err = (field: string) => (fieldError?.field === field ? <p className="bc-error">{fieldError.message}</p> : null);

  return (
    <div className="bc" ref={top}>
      <section className="bc-hero">
        <div className="eyebrow">Free brick calculator</div>
        <h1>How many bricks does your house need?</h1>
        <p>Upload your house plan and get a brick estimate and a quotation in about a minute.</p>
        <ol className="bc-steps" aria-label="Progress">
          {["Your plan", "Your details", "Bricks & quote"].map((s, i) => {
            const at = step === "start" || step === "cover" || step === "analysing" ? 0 : step === "details" ? 1 : 2;
            return (
              <li key={s} className={i < at ? "done" : i === at ? "on" : undefined}>
                <span>{i + 1}</span>
                {s}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="bc-body">
        {step === "start" && (
          <form className="bc-card" onSubmit={analyse}>
            {planReader && (
            <div className="bc-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={mode === "plan"} className={mode === "plan" ? "on" : undefined} onClick={() => setMode("plan")}>
                Upload my plan
              </button>
              <button type="button" role="tab" aria-selected={mode === "house-size"} className={mode === "house-size" ? "on" : undefined} onClick={() => setMode("house-size")}>
                No plan? Use house size
              </button>
            </div>
            )}

            {mode === "plan" ? (
              <label className={`bc-drop${file ? " has-file" : ""}`}>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError("");
                  }}
                />
                <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden>
                  <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {file ? (
                  <>
                    <b>{file.name}</b>
                    <span>{(file.size / 1024 / 1024).toFixed(1)} MB · tap to change</span>
                  </>
                ) : (
                  <>
                    <b>Tap to upload your plan</b>
                    <span>PDF, or a clear photo of the plan (JPG/PNG), up to 4 MB</span>
                  </>
                )}
              </label>
            ) : (
              <div className="bc-size">
                <label>
                  Floor area (m²)
                  <input inputMode="decimal" value={floorArea} onChange={(e) => setFloorArea(e.target.value)} placeholder="e.g. 140" />
                </label>
                <label>
                  Bedrooms
                  <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <p className="bc-hint">A rough estimate for a single-storey house. A plan gives a much closer figure.</p>
              </div>
            )}

            <button type="submit" className="bc-primary">
              {mode === "plan" ? "Next: hide personal details →" : "Calculate my bricks →"}
            </button>
            {mode === "plan" && planReader && (
              <label className="bc-check">
                <input type="checkbox" checked={planConsent} onChange={(e) => setPlanConsent(e.target.checked)} />
                <span>
                  I agree to my plan being sent to {planReader} to read the measurements, after I&apos;ve covered my personal details. It
                  isn&apos;t stored.
                </span>
              </label>
            )}
            {error && <p className="bc-error">{error}</p>}
            <p className="bc-privacy">
              {mode === "plan"
                ? "Next, you'll cover your name and address on your phone — they never leave your device."
                : "Your details stay private and are only used for your quotation."}
            </p>
          </form>
        )}

        {(step === "start" || step === "cover") && <Turnstile onToken={setBotToken} resetKey={botReset} />}

        {step === "cover" && file && (
          <div className="bc-card">
            <PlanCover file={file} onDone={sendCoveredPlan} onCancel={() => setStep("start")} />
          </div>
        )}

        {step === "analysing" && (
          <div className="bc-card bc-analysing" role="status" aria-live="polite">
            <span className="bc-spinner" aria-hidden />
            <b>{mode === "plan" ? PROGRESS[progress] : "Working out your bricks…"}</b>
            <span>{mode === "plan" ? "This usually takes under a minute." : "Almost there."}</span>
          </div>
        )}

        {step === "details" && (
          <form className="bc-card" onSubmit={unlock} noValidate>
            <div className="bc-ready">
              <span className="bc-tick" aria-hidden>
                ✓
              </span>
              <div>
                <b>Your brick estimate is ready</b>
                <span>Tell us where to send it and we&apos;ll show your bricks and quotation.</span>
              </div>
            </div>
            <div className="bc-teaser" aria-hidden>
              <span>██,███ bricks</span>
              <em>US$█,███.██</em>
            </div>

            <label className="bc-field">
              Your name
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" enterKeyHint="next" />
              {err("name")}
            </label>
            <input
              className="bc-trap"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <label className="bc-field">
              WhatsApp number
              <span className="bc-phone">
                <em>+263</em>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel-national" placeholder="77 123 4567" enterKeyHint="next" />
              </span>
              {err("phone")}
            </label>
            <fieldset className="bc-field">
              <legend>I am a…</legend>
              <div className="bc-chips">
                {CUSTOMER_TYPES.map((t) => (
                  <button type="button" key={t} className={customerType === t ? "on" : undefined} onClick={() => setCustomerType(t)} aria-pressed={customerType === t}>
                    {t}
                  </button>
                ))}
              </div>
              {err("customerType")}
            </fieldset>
            <label className="bc-field">
              Brick type for your quotation
              <select value={product} onChange={(e) => setProduct(e.target.value)}>
                {bricks.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              {err("product")}
            </label>

            {autoSend && (
              <label className="bc-check">
                <input type="checkbox" checked={sendToWhatsApp} onChange={(e) => setSendToWhatsApp(e.target.checked)} />
                <span>Send the quotation to my WhatsApp</span>
              </label>
            )}
            <label className="bc-check">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I agree to Victors Holdings contacting me on WhatsApp about this quotation.</span>
            </label>
            {err("consent")}
            {err("form")}

            <button type="submit" className="bc-primary" disabled={busy}>
              {busy ? "Preparing your quotation…" : "Show my bricks & quotation →"}
            </button>
          </form>
        )}

        {step === "result" && result && <Result {...result} onRestart={restart} />}
      </section>
    </div>
  );
}

function Result({ quote: q, pdfUrl, autoSentToCustomer, onRestart }: { quote: Quote; pdfUrl: string; autoSentToCustomer: boolean; onRestart: () => void }) {
  const e = q.estimate;
  const waMessage = [
    `Hi Victors Holdings 👋 Here's my brick quotation *${q.number}*:`,
    "",
    `*Product:* ${q.product}`,
    `*Bricks:* ${fmt(q.quantity)}`,
    `*Quote total:* ${money(q, q.total)} (excl. delivery)`,
    `*Valid until:* ${q.validUntil}`,
    "",
    `Quotation PDF: ${pdfUrl}`,
    "",
    "I'd like to confirm the price and delivery.",
  ].join("\n");

  return (
    <div className="bc-result">
      <div className="bc-card bc-total">
        <span className="bc-kicker">Estimated bricks needed</span>
        <b>{fmt(e.total)}</b>
        <span>
          Likely range {fmt(e.range[0])} – {fmt(e.range[1])} ·{" "}
          <em className={`bc-conf ${e.confidence}`}>{e.confidence === "high" ? "High" : e.confidence === "medium" ? "Medium" : "Rough"} confidence</em>
        </span>
        {e.floorArea ? <small>House floor area: {e.floorArea} m²</small> : null}
      </div>

      <div className="bc-card bc-quote">
        <div className="bc-quote-head">
          <span className="bc-kicker">Quotation {q.number}</span>
          <small>Valid until {q.validUntil}</small>
        </div>
        <div className="bc-quote-row">
          <span>{q.product}</span>
          <span>{fmt(q.quantity)} bricks</span>
        </div>
        <div className="bc-quote-row">
          <span>Price per 1,000</span>
          <span>{money(q, q.pricePerThousand)}</span>
        </div>
        {q.minimumOrderApplied && <p className="bc-note">Minimum order for this brick is {fmt(q.quantity)}.</p>}
        <div className="bc-quote-total">
          <span>Total (excl. delivery)</span>
          <b>{money(q, q.total)}</b>
        </div>
        <p className="bc-note">Delivery cost is confirmed by Victors based on your site location.</p>
        <div className="bc-actions">
          <a className="bc-primary" href={pdfUrl} download>
            Download quotation (PDF)
          </a>
          <WhatsAppButton message={waMessage} source="brick_calculator_result" className="bc-wa">
            Send to my WhatsApp
          </WhatsAppButton>
        </div>
        <p className="bc-note">
          {autoSentToCustomer
            ? "We've also sent the quotation to your WhatsApp."
            : "“Send to my WhatsApp” opens a chat with Victors with your quotation link — send it to keep a copy and confirm your order."}
        </p>
      </div>

      <details className="bc-card bc-breakdown">
        <summary>How we worked it out</summary>
        <table>
          <tbody>
            {e.lines.map((l) => (
              <tr key={l.label}>
                <td>{l.label}</td>
                <td>
                  {l.area.toFixed(1)} m² × {l.skins === 2 ? "2 layers" : "1 layer"}
                </td>
                <td>{fmt(l.bricks)}</td>
              </tr>
            ))}
            <tr>
              <td>Breakages and cutting</td>
              <td />
              <td>{fmt(e.wastage)}</td>
            </tr>
          </tbody>
        </table>
        <ul>
          {e.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="bc-note">This is an estimate. Victors will confirm the final quantity before you order.</p>
      </details>

      <button type="button" className="bc-link" onClick={onRestart}>
        Calculate another plan
      </button>
    </div>
  );
}
