"use client";

import { type RefObject, useCallback, useLayoutEffect, useRef } from "react";

const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
const duration = 880; // the unfold itself, slow enough to read
const settleMs = 300; // the closed tile eases into place before it opens
const beatMs = 80; // a short pause once the screen has locked
const headerSpace = 88; // fixed header plus breathing room

type Snapshot = {
  rects: Map<string, DOMRect>; // viewport rects at capture time
  anchor: string | null;
};

/**
 * FLIP for a grid. Call `capture()` right before a state change that moves children;
 * on the next layout the children glide from where they were to where they are.
 *
 * With an anchor, that child keeps its place on screen (the page scrolls to hold it) and
 * unfolds from its old box to its new one. Call `settle()` before opening, so the camera
 * locks on the closed tile and the unfold starts a moment later.
 * Children need a stable `data-flip` id.
 */
export function useFlip(container: RefObject<HTMLElement | null>, key: string) {
  const snapshot = useRef<Snapshot | null>(null);

  const children = () =>
    (Array.from(container.current?.children ?? []) as HTMLElement[]).filter((child) => child.dataset.flip);

  const settle = useCallback((id: string) => {
    const node = container.current?.querySelector<HTMLElement>(`[data-flip="${CSS.escape(id)}"]`);
    return new Promise<void>((resolve) => {
      if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        resolve();
        return;
      }
      const rect = node.getBoundingClientRect();
      const offset = Math.max(headerSpace, (window.innerHeight - rect.height) / 2);
      const top = window.scrollY + rect.top - offset;
      if (Math.abs(top - window.scrollY) <= 4) {
        window.setTimeout(resolve, beatMs);
        return;
      }
      glideScroll(top, settleMs, resolve);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = useCallback((anchor: string | null = null) => {
    const rects = new Map<string, DOMRect>();
    for (const child of children()) {
      child.getAnimations().forEach((animation) => animation.finish());
      rects.set(child.dataset.flip!, child.getBoundingClientRect());
    }
    snapshot.current = { rects, anchor };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const snap = snapshot.current;
    snapshot.current = null;
    if (!snap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = children();
    const anchorNode = snap.anchor ? items.find((child) => child.dataset.flip === snap.anchor) : undefined;

    // 1. Hold the anchor where it was on screen. Keep scroll instant for the whole unfold
    // so the page cannot ease toward the open card after it has already grown.
    const anchorBefore = snap.anchor ? snap.rects.get(snap.anchor) : undefined;
    const releaseScroll = holdInstantScroll();
    window.setTimeout(releaseScroll, duration + 40);
    if (anchorNode && anchorBefore) {
      const drift = anchorNode.getBoundingClientRect().top - anchorBefore.top;
      if (Math.abs(drift) > 1) window.scrollTo(0, window.scrollY + drift);
    }

    // The camera already settled on the closed tile. Unfold now; don't scroll to the open card.
    if (!reduce) {
      const timing: KeyframeAnimationOptions = { duration, easing, fill: "backwards" };
      for (const child of items) {
        const before = snap.rects.get(child.dataset.flip!);
        if (!before) continue;
        const now = child.getBoundingClientRect();
        const grew = now.width > before.width + 1 || now.height > before.height + 1;
        const resized = grew || now.width < before.width - 1 || now.height < before.height - 1;

        if (child === anchorNode && grew) {
          // Unfold: reveal the new box starting from the old one, content never stretched
          const inset = (top: number, right: number, bottom: number, left: number) =>
            `inset(${top}px ${right}px ${bottom}px ${left}px round 24px)`;
          child.animate(
            [
              {
                clipPath: inset(
                  Math.max(0, before.top - now.top),
                  Math.max(0, now.right - before.right),
                  Math.max(0, now.bottom - before.bottom),
                  Math.max(0, before.left - now.left),
                ),
              },
              { clipPath: inset(0, 0, 0, 0) },
            ],
            timing,
          );
        } else if (resized) {
          const dx = before.left - now.left;
          const dy = before.top - now.top;
          child.animate(
            [
              { opacity: 0.5, transform: `translate(${dx}px, ${dy}px) scale(0.97)` },
              { opacity: 1, transform: "none" },
            ],
            timing,
          );
        } else {
          const dx = before.left - now.left;
          const dy = before.top - now.top;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            child.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], timing);
          }
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { capture, settle };
}

/** The page sets `scroll-behavior: smooth`. Turn that off until `release`. */
function holdInstantScroll() {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  return () => {
    root.style.scrollBehavior = previous;
  };
}

/** Scroll to `top` over `ms`, then hold a beat so the unfold starts after the screen has locked. */
function glideScroll(top: number, ms: number, done: () => void) {
  const release = holdInstantScroll();
  const from = window.scrollY;
  const start = performance.now();
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    window.scrollTo(0, from + (top - from) * ease(t));
    if (t < 1) {
      requestAnimationFrame(step);
      return;
    }
    window.setTimeout(() => {
      release();
      done();
    }, beatMs);
  };
  requestAnimationFrame(step);
}
