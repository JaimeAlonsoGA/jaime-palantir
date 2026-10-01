"use client";

import { useEffect, useRef } from "react";

// public/sprites/sheep.png: twelve 32×32 frames in a row.
const frames = {
  front: [0, 1],
  back: [2, 3],
  side: [4, 5], // faces right; mirrored for left
  graze: [9, 10, 9, 10, 9, 10, 8, 6, 7, 6, 7, 11], // head down, bite, chew, lick
  stand: [0],
};
const sprite = 32;
const scale = 3;
const size = sprite * scale;
const walkSpeed = 26; // px per second
const walkFps = 4;
const grazeFps = 3;
const petCooldownMs = 250; // one heart per quarter second: feels instant, can't be spammed

type Mode = "walk" | "graze" | "stand";
const between = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * A sheep that wanders its patch, stops to graze, and wanders on. Idle, on purpose.
 * Pet it and a heart floats up.
 * Drawn on one element moved by requestAnimationFrame; React renders it once.
 */
export function PixelSheep() {
  const field = useRef<HTMLDivElement>(null);
  const sheep = useRef<HTMLDivElement>(null);
  const pet = useRef<() => void>(() => {});

  useEffect(() => {
    const area = field.current;
    const body = sheep.current;
    if (!area || !body) return;

    const bounds = () => ({ w: Math.max(0, area.clientWidth - size), h: Math.max(0, area.clientHeight - size) });
    let { w, h } = bounds();
    const art = body.lastElementChild as HTMLElement; // the shadow comes first
    const draw = (x: number, y: number, frame: number, flip: boolean) => {
      body.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      art.style.backgroundPosition = `${-frame * size}px 0`;
      art.style.transform = `scaleX(${flip ? -1 : 1})`;
    };

    let x = w * 0.35;
    let y = h * 0.55;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(x, y, frames.graze[0], false);
      return;
    }

    let mode: Mode = "graze";
    let until = performance.now() + between(3000, 6000);
    let target = { x, y };
    let flip = false;
    let started = performance.now();
    let last = performance.now();
    let raf = 0;

    const pickTarget = () => {
      for (let tries = 0; tries < 8; tries++) {
        const next = { x: between(0, w), y: between(0, h) };
        if (Math.hypot(next.x - x, next.y - y) > 60) return next;
      }
      return { x: between(0, w), y: between(0, h) };
    };

    let lastPet = 0;
    pet.current = () => {
      const now = performance.now();
      if (now - lastPet < petCooldownMs) return;
      lastPet = now;
      heart(area, x + size / 2, y + 18);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = now - started;

      if (mode === "walk") {
        const dx = target.x - x;
        const dy = target.y - y;
        const distance = Math.hypot(dx, dy);
        if (distance < 1) {
          mode = Math.random() < 0.8 ? "graze" : "stand";
          until = now + (mode === "graze" ? between(4000, 9000) : between(1200, 2500));
          started = now;
        } else {
          const step = Math.min(distance, walkSpeed * dt);
          x += (dx / distance) * step;
          y += (dy / distance) * step;
          const beat = Math.floor((elapsed / 1000) * walkFps);
          let set = frames.side;
          if (Math.abs(dy) > Math.abs(dx) * 1.2) set = dy > 0 ? frames.front : frames.back;
          else flip = dx < 0;
          draw(x, y, set[beat % set.length], set === frames.side && flip);
        }
      }

      if (mode === "graze" || mode === "stand") {
        const set = mode === "graze" ? frames.graze : frames.stand;
        draw(x, y, set[Math.floor((elapsed / 1000) * grazeFps) % set.length], false);
        if (now > until) {
          mode = "walk";
          target = pickTarget();
          started = now;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const resize = new ResizeObserver(() => {
      ({ w, h } = bounds());
      x = Math.min(x, w);
      y = Math.min(y, h);
      target = { x: Math.min(target.x, w), y: Math.min(target.y, h) };
    });
    resize.observe(area);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
    };
  }, []);

  return (
    <div ref={field} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={sheep}
        onPointerDown={() => pet.current()}
        className="pointer-events-auto absolute left-0 top-0 cursor-pointer touch-manipulation select-none will-change-transform"
        style={{ width: size, height: size }}
      >
        {/* Soft shadow under the hooves */}
        <span className="absolute bottom-1 left-1/2 h-3 w-16 -translate-x-1/2 rounded-[50%] bg-black/25 blur-[2px]" />
        <div
          className="relative h-full w-full [image-rendering:pixelated]"
          style={{
            backgroundImage: "url(/sprites/sheep.png)",
            backgroundSize: `${size * 12}px ${size}px`,
          }}
        />
      </div>
    </div>
  );
}

/** A heart that floats up from where the sheep was petted and fades. Blue, to read on the warm gradient. */
function heart(area: HTMLElement, x: number, y: number) {
  const node = document.createElement("span");
  node.textContent = "💙";
  node.className = "sheep-heart";
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.setProperty("--drift", `${Math.round((Math.random() - 0.5) * 36)}px`);
  node.addEventListener("animationend", () => node.remove());
  area.appendChild(node);
}
