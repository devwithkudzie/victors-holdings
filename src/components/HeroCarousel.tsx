"use client";

import { getImageProps } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_FADE_MS, HERO_INTERVAL_MS, type HeroSlide } from "@/lib/hero";
import { QuoteButton } from "./QuoteSheet";

/** Wide photo on desktop, tall photo on phones, each cropped to fill the hero. */
function SlidePicture({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  const common = { alt: slide.alt, fill: true, sizes: "100vw", quality: 80, priority };
  const { props: desktop } = getImageProps({ ...common, src: slide.desktop.src });
  const { props: mobile } = getImageProps({ ...common, src: slide.mobile.src });
  return (
    <picture>
      <source media="(min-width: 900px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
      <img
        {...mobile}
        alt={slide.alt}
        style={
          {
            ...mobile.style,
            "--pos-m": slide.mobile.position ?? "50% 50%",
            "--pos-d": slide.desktop.position ?? "50% 50%",
          } as React.CSSProperties
        }
      />
    </picture>
  );
}

/**
 * Full-width homepage hero: a nationwide-delivery slide, then the top brick deals with price labels.
 * Each photo slowly zooms/pans (Ken Burns) and cross-fades into the next, like one continuous video.
 * Pauses when a control has focus, when the tab is hidden or the visitor presses pause,
 * and stays still for visitors who prefer reduced motion. Swipe to change on phones.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const heroSlides = slides;
  const count = heroSlides.length;
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const prevIndex = useRef(0);
  const [userPaused, setUserPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  /** Phone's data-saver mode: show the first photo only, no autoplay or movement */
  const [saveData, setSaveData] = useState(false);
  /** Photos are only loaded once they're next in line, so visitors don't download all of them upfront */
  const [loadedUpTo, setLoadedUpTo] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const playing = !userPaused && !focused && !reducedMotion && !tabHidden && !saveData;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setSaveData(!!conn?.saveData);
    const onMq = () => setReducedMotion(mq.matches);
    const onVis = () => setTabHidden(document.hidden);
    mq.addEventListener("change", onMq);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Preload the next photo once the current one is showing (not on data-saver)
  useEffect(() => {
    const next = saveData ? index : Math.min(index + 1, count - 1);
    if (next > loadedUpTo) {
      const t = window.setTimeout(() => setLoadedUpTo(next), index === 0 ? 1500 : 0);
      return () => window.clearTimeout(t);
    }
  }, [index, saveData, loadedUpTo, count]);

  // Keep the outgoing photo moving while it fades out, so the cut feels like continuous footage
  useEffect(() => {
    if (prevIndex.current === index) return;
    setLeaving(prevIndex.current);
    prevIndex.current = index;
    const t = window.setTimeout(() => setLeaving(null), HERO_FADE_MS);
    return () => window.clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => go(index + 1), HERO_INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, go]);

  return (
    <section
      className={`hc${saveData ? " is-still" : ""}`}
      aria-roledescription="carousel"
      aria-label="Bricks on offer"
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
      style={
        {
          "--hc-interval": `${HERO_INTERVAL_MS}ms`,
          "--hc-fade": `${HERO_FADE_MS}ms`,
          "--hc-play": playing ? "running" : "paused",
        } as React.CSSProperties
      }
    >
      <div className="hc-slides">
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className={`hc-slide kb-${i % 3}${s.blurBackground ? " is-blurred" : ""}${i === index ? " is-active" : ""}${i === leaving ? " is-leaving" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${s.kind === "deal" ? s.deal.name : s.kind === "referral" ? "Tora Mari refer and earn" : "Nationwide delivery"}`}
            aria-hidden={i !== index}
          >
            {(i <= loadedUpTo || i === index) && <SlidePicture slide={s} priority={i === 0} />}
          </div>
        ))}
        <div className="hc-overlay" aria-hidden />
      </div>

      <button
        type="button"
        className="hc-pause"
        onClick={() => setUserPaused((p) => !p)}
        aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
      >
        {userPaused ? (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
          </svg>
        )}
      </button>

      <div className="hc-content">
        <h1 className="sr-only">Bricks delivered nationwide across Zimbabwe — common bricks, face bricks and pavers</h1>
        <div className="hc-copy-stack" aria-live={playing ? "off" : "polite"}>
          {heroSlides.map((s, i) => (
            <div key={s.id} className={`hc-copy${i === index ? " is-active" : ""}`} aria-hidden={i !== index} inert={i !== index}>
              {s.kind === "delivery" ? (
                <div className="hd-delivery">
                  <span className="hd-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" width="30" height="30">
                      <path
                        d="M2 7h11v9H2zM13 10h4l4 3v3h-8M5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="hd-title">Nationwide delivery</p>
                  <p className="hd-sub">Bricks delivered anywhere in Zimbabwe</p>
                  <div className="hd-actions">
                    <QuoteButton source="home_hero_delivery" label="Get a quote" className="hd-btn" />
                    <a href="#deals-title" className="hd-btn hd-ghost">
                      See mega deals
                    </a>
                  </div>
                </div>
              ) : s.kind === "referral" ? (
                <div className="hd-delivery hd-referral">
                  <span className="hd-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" width="30" height="30">
                      <path
                        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="hd-title">Tora Mari!</p>
                  <p className="hd-sub">
                    Refer a customer and earn <b className="hd-reward">{s.reward}</b> when their order is delivered and paid.
                  </p>
                  <div className="hd-actions">
                    <Link href="/tora-mari" className="hd-btn">
                      Refer &amp; earn →
                    </Link>
                    <Link href="/tora-mari#rules" className="hd-btn hd-ghost">
                      How it works
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="hd-deal">
                  <div className="hd-price">
                    {s.deal.save && <span className="hd-save">{s.deal.save}</span>}
                    <span className="hd-unit">{s.deal.unit}</span>
                    <b>{s.deal.now}</b>
                  </div>
                  <div className="hd-panel">
                    {s.deal.thumb && s.blurBackground && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="hd-thumb" src={s.deal.thumb} alt="" width={96} height={96} />
                    )}
                    <div className="hd-info">
                      <p className="hd-name">{s.deal.name}</p>
                      <p className="hd-now">
                        {s.deal.was ? (
                          <>
                            Now <b>{s.deal.now}</b> <s>was {s.deal.was}</s>
                          </>
                        ) : (
                          <>
                            <b>{s.deal.now}</b> {s.deal.unit}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="hd-actions">
                      <QuoteButton product={s.deal.name} source={`home_hero_${s.id}`} label="Choose options" className="hd-btn" />
                      <Link href={s.deal.href} className="hd-btn hd-ghost">
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
