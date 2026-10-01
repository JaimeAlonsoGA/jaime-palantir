"use client";

import { type RefObject, useCallback, useLayoutEffect, useRef } from "react";

const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
const focusMs = 180;
const beatMs = 30;
const verticalMs = 240;
const horizontalMs = 260;
const headerSpace = 88;

type Box = { top: number; left: number; width: number; height: number };

type Snapshot = {
  rects: Map<string, DOMRect>;
  anchor: string | null;
};

/**
 * FLIP for the project grid.
 * `settle()` centers the closed tile. The next layout plays the opening card as one motion:
 * it grows down, then widens, border included. The other tiles glide aside.
 * Children need a stable `data-flip` id and a `[data-shell]` inside it.
 */
export function useFlip(container: RefObject<HTMLElement | null>, key: string) {
  const snapshot = useRef<Snapshot | null>(null);
  const waiters = useRef<Array<() => void>>([]);
  const epoch = useRef(0);

  const cells = () =>
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
      glideScroll(top, focusMs, resolve);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = useCallback((anchor: string | null = null) => {
    const rects = new Map<string, DOMRect>();
    for (const cell of cells()) {
      cell.getAnimations().forEach((animation) => animation.finish());
      rects.set(cell.dataset.flip!, visualBox(cell));
    }
    snapshot.current = { rects, anchor };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipped = useCallback(
    () =>
      new Promise<void>((resolve) => {
        waiters.current.push(resolve);
      }),
    [],
  );

  useLayoutEffect(() => {
    const snap = snapshot.current;
    const mine = ++epoch.current;
    const releaseScroll = holdInstantScroll();
    let freed = false;
    const freeScroll = () => {
      if (freed) return;
      freed = true;
      releaseScroll();
    };
    const finish = () => {
      if (mine !== epoch.current) return;
      epoch.current += 1;
      if (snapshot.current === snap) snapshot.current = null;
      freeScroll();
      const waiting = waiters.current;
      waiters.current = [];
      waiting.forEach((fn) => fn());
    };
    if (!snap) {
      finish();
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = cells();
    const anchorNode = snap.anchor ? items.find((cell) => cell.dataset.flip === snap.anchor) : undefined;

    if (anchorNode) {
      anchorNode.getAnimations().forEach((animation) => animation.cancel());
      const before = snap.rects.get(snap.anchor!);
      const drift = before ? anchorNode.getBoundingClientRect().top - before.top : 0;
      if (before && Math.abs(drift) > 1) window.scrollTo(0, window.scrollY + drift);
    }

    const shell = anchorNode?.querySelector<HTMLElement>("[data-shell]") ?? null;
    const from = anchorNode && snap.anchor ? snap.rects.get(snap.anchor) : undefined;
    const to = anchorNode?.getBoundingClientRect();
    const motion = !reduce && shell && from && to ? stagedMotion(from, to) : null;
    let animation: Animation | null = null;

    if (motion && shell) {
      animation = moveShell(shell, motion.frames, motion.ms, () => {
        if (mine !== epoch.current) return;
        releaseShell(shell);
        finish();
      });
    } else if (shell && mine === epoch.current) {
      releaseShell(shell);
    }

    if (!reduce) {
      const timing: KeyframeAnimationOptions = { duration: motion?.ms ?? 320, easing, fill: "backwards" };
      for (const cell of items) {
        if (cell === anchorNode) continue;
        const before = snap.rects.get(cell.dataset.flip!);
        if (!before) continue;
        const now = cell.getBoundingClientRect();
        const dx = before.left - now.left;
        const dy = before.top - now.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          cell.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], timing);
        }
      }
    }

    if (!motion) finish();

    return () => {
      epoch.current += 1;
      animation?.cancel();
      freeScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { capture, settle, flipped };
}

let scrollHolds = 0;
let savedScrollBehavior = "";

/** The page sets `scroll-behavior: smooth`. Turn that off until every hold is released. */
export function holdInstantScroll() {
  const root = document.documentElement;
  if (scrollHolds === 0) savedScrollBehavior = root.style.scrollBehavior;
  scrollHolds += 1;
  root.style.scrollBehavior = "auto";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollHolds = Math.max(0, scrollHolds - 1);
    if (scrollHolds === 0) root.style.scrollBehavior = savedScrollBehavior;
  };
}

/** Put a shell that was animating back in the grid. A new gesture starts from the real layout. */
export function releaseShells(root: ParentNode | null) {
  root?.querySelectorAll<HTMLElement>("[data-shell]").forEach(releaseShell);
}

function visualBox(cell: HTMLElement) {
  const shell = cell.querySelector<HTMLElement>("[data-shell]");
  if (shell?.style.position === "fixed") return shell.getBoundingClientRect();
  return cell.getBoundingClientRect();
}

/** Open grows down, then across. Close narrows, then shortens. */
function stagedMotion(from: DOMRect, to: DOMRect) {
  const grew = to.height > from.height + 2 || to.width > from.width + 2;
  const vertical = grew
    ? { top: to.top, left: from.left, width: from.width, height: to.height }
    : { top: from.top, left: to.left, width: to.width, height: from.height };
  const end = { top: to.top, left: to.left, width: to.width, height: to.height };
  const growY = Math.abs(to.height - from.height) + Math.abs(to.top - from.top) > 2;
  const growX = Math.abs(to.width - from.width) + Math.abs(to.left - from.left) > 2;
  if (growY && growX) {
    const ms = verticalMs + horizontalMs;
    return {
      ms,
      frames: [
        { offset: 0, ...px(from), easing },
        { offset: (grew ? verticalMs : horizontalMs) / ms, ...px(vertical), easing },
        { offset: 1, ...px(end) },
      ],
    };
  }
  if (growY) return { ms: verticalMs, frames: [px(from), px(end)] };
  if (growX) return { ms: horizontalMs, frames: [px(from), px(end)] };
  return null;
}

function px(box: Box) {
  return {
    top: `${box.top}px`,
    left: `${box.left}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
}

/** Grow the bordered shell on the real box. Width and height, never a stretch and never a clip. */
function moveShell(shell: HTMLElement, frames: Keyframe[], ms: number, done: () => void) {
  shell.getAnimations().forEach((animation) => animation.cancel());
  const start = frames[0] as { top: string; left: string; width: string; height: string };
  shell.style.position = "fixed";
  shell.style.zIndex = "30";
  shell.style.margin = "0";
  shell.style.top = start.top;
  shell.style.left = start.left;
  shell.style.width = start.width;
  shell.style.height = start.height;
  // Linear overall time so the midpoint stays put. Each segment eases on its own.
  const animation = shell.animate(frames, { duration: ms, easing: "linear", fill: "forwards" });
  animation.finished.then(done, done);
  return animation;
}

function releaseShell(shell: HTMLElement) {
  shell.style.position = "";
  shell.style.zIndex = "";
  shell.style.margin = "";
  shell.style.top = "";
  shell.style.left = "";
  shell.style.width = "";
  shell.style.height = "";
  shell.getAnimations().forEach((animation) => animation.cancel());
}

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
