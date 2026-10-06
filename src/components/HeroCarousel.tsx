"use client";

import { getImageProps } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_FADE_MS, HERO_INTERVAL_MS, heroSlides } from "@/lib/hero";
import { QuoteButton } from "./QuoteSheet";

const BRICK_RANGE_HREF = "/products/red-common-bricks#types";

/** Wide photo on desktop, tall photo on phones, each cropped to fill the hero. */
function SlidePicture({ slide, priority }: { slide: (typeof heroSlides)[number]; priority: boolean }) {
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
 * Full-width homepage hero that plays through the brick range like one continuous video:
 * each photo slowly zooms/pans (Ken Burns) and cross-fades into the next.
 * Pauses when a control has focus, when the tab is hidden or the visitor presses pause,
 * and stays still for visitors who prefer reduced motion. Swipe to change on phones.
 */
export function HeroCarousel() {
  const count = heroSlides.length;
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const prevIndex = useRef(0);
  const [userPaused, setUserPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const playing = !userPaused && !focused && !reducedMotion && !tabHidden;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = () => setReducedMotion(mq.matches);
    const onVis = () => setTabHidden(document.hidden);
    mq.addEventListener("change", onMq);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

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

  const active = heroSlides[index];

  return (
    <section
      className="hc"
      aria-roledescription="carousel"
      aria-label="Victors Holdings brick range"
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
            className={`hc-slide kb-${i % 3}${i === index ? " is-active" : ""}${i === leaving ? " is-leaving" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${s.name}`}
            aria-hidden={i !== index}
          >
            <SlidePicture slide={s} priority={i === 0} />
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
        <p className="hc-brand">Victors Holdings</p>
        <h1 className="hc-lead">Bricks for your next project.</h1>

        <div className="hc-copy-stack" aria-live={playing ? "off" : "polite"}>
          {heroSlides.map((s, i) => (
            <div key={s.id} className={`hc-copy${i === index ? " is-active" : ""}`} aria-hidden={i !== index}>
              <p className="hc-name">{s.name}</p>
              <p className="hc-tagline">{s.tagline}</p>
            </div>
          ))}
        </div>

        <div className="hc-actions">
          <Link className="primary" href={BRICK_RANGE_HREF}>
            Explore Our Brick Range
          </Link>
          <QuoteButton product={active.product} source={`home_hero_${active.id}`} label="WhatsApp Us" className="hc-wa" />
        </div>

      </div>
    </section>
  );
}
