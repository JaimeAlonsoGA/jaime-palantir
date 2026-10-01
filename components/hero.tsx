"use client";

import type { Person } from "@/lib/content/schema";
import { cn } from "@/lib/utils";
import { skillStyle } from "./skill-icons";

import { SeeMore } from "./seeMore";
import { type CSSProperties, useEffect, useMemo, useState } from "react";

// Muted VS Code Dark+ tones. Each word takes the next one so the line reads like code.
const syntax = ["#569CD6", "#DCDCAA", "#6A9955", "#CE9178", "#D4D4D4"];
const punctuation = "#D4D4D4";

function tokenize(text: string) {
  let word = 0;
  return (text.match(/[\w'/-]+|\s+|[^\w\s]/g) ?? []).map((token) => {
    if (/^\s+$/.test(token)) return { token, color: undefined };
    if (/^[\w'/-]+$/.test(token)) return { token, color: syntax[word++ % syntax.length] };
    return { token, color: punctuation };
  });
}

function Code({ text }: { text: string }) {
  return (
    <>
      {tokenize(text).map(({ token, color }, index) => (
        color ? (
          <span key={index} className="whitespace-nowrap" style={{ color }}>
            {token}
          </span>
        ) : (
          token
        )
      ))}
    </>
  );
}

// Reading order, in ms from first paint: name, phrase, skills group by group, actions, then the header.
const timing = {
  name: 0,
  box: 200,
  typeFrom: 450,
  typeSpeed: 16,
  skills: 1400,
  groupGap: 150,
  itemGap: 35,
  actions: 2000,
  cycleFrom: 3400,
  cycleEvery: 1800,
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Timers count from first paint, not from hydration, so the sequence stays in step with the CSS.
function sincePaint(ms: number) {
  return Math.max(0, ms - performance.now());
}

const Hero = ({
  name,
  headline,
  skills,
}: {
  name: string;
  headline: string;
  skills: Person["skills"];
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const allSkills = useMemo(() => skills.flatMap((group) => group.items), [skills]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayedText(headline);
      return;
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      let index = 0;
      interval = setInterval(() => {
        index += 1;
        setDisplayedText(headline.slice(0, index));
        if (index >= headline.length && interval) clearInterval(interval);
      }, timing.typeSpeed);
    }, sincePaint(timing.typeFrom));

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [headline]);

  // Once everything has arrived, light up one skill at a time. It keeps going while the user hovers others.
  useEffect(() => {
    if (allSkills.length === 0 || prefersReducedMotion()) return;
    let remaining: string[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;

    const activateRandom = () => {
      if (remaining.length === 0) remaining = [...allSkills];
      const [picked] = remaining.splice(Math.floor(Math.random() * remaining.length), 1);
      setActiveSkill(picked);
    };

    const timeout = setTimeout(() => {
      activateRandom();
      interval = setInterval(activateRandom, timing.cycleEvery);
    }, sincePaint(timing.cycleFrom));

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [allSkills]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center w-full">
      <div className="text-white w-full px-6 pt-24 pb-12 sm:px-8 flex flex-col items-center max-w-5xl">
        <h1
          className="enter-title text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-center"
          style={delay(timing.name)}
        >
          {/* Solid color on purpose: transparent gradient text is invisible to LCP, and this is the page's main content */}
          <span className="font-extrabold text-slate-200">{name}</span>
        </h1>

        <pre
          className="enter-fade tracking-wider mb-8 sm:mb-10 whitespace-pre-wrap rounded-md border border-white/10 bg-[#1E1E1E] px-5 py-4 text-left text-sm font-mono w-fit max-w-full sm:max-w-[43.875rem] lg:max-w-[52rem]"
          style={delay(timing.box)}
        >
          {/* Hugs the text, never wider than the badge grid. The full line sits invisible underneath so the box keeps its final size while typing */}
          <span className="sr-only">{headline}</span>
          <code aria-hidden className="grid">
            <span className="invisible [grid-area:1/1]">
              <Code text={headline} /> |
            </span>
            <span className="[grid-area:1/1]">
              <Code text={displayedText} />
              <span className="caret ml-1 text-[#AEAFAD]">|</span>
            </span>
          </code>
        </pre>

        <div className="flex w-full flex-col items-center gap-4 lg:gap-3 mb-10">
          {skills.map((group, groupIndex) => (
            <ul key={group.group} aria-label={group.group} className="flex w-full flex-wrap justify-center gap-2 sm:gap-2.5 lg:w-auto lg:flex-nowrap lg:gap-3">
              {/* Fixed widths keep columns aligned: 2 on phones, 4 on tablets, one row per group on desktop */}
              {group.items.map((skill, index) => {
                const { Icon, color } = skillStyle(skill);
                const lit = hoveredSkill === skill || activeSkill === skill;
                return (
                  <li
                    key={skill}
                    className="enter-pop w-[calc(50%-0.25rem)] sm:w-[10.5rem] lg:w-auto"
                    style={delay(timing.skills + groupIndex * timing.groupGap + index * timing.itemGap)}
                  >
                    <div
                      className={cn(
                        "flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold sm:gap-2 sm:px-3 sm:py-2 lg:px-4",
                        "cursor-default border transition-colors duration-500 ease-out",
                        // Hover and the automatic highlight share one look
                        lit ? "border-white/40 bg-zinc-900/60 text-zinc-50" : "border-transparent bg-zinc-100 text-zinc-900",
                      )}
                      onMouseEnter={() => setHoveredSkill(skill)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      {Icon ? (
                        <Icon
                          aria-hidden
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors duration-500"
                          style={{ color: lit ? color : "inherit" }}
                        />
                      ) : null}
                      <span
                        className="whitespace-nowrap text-[11px] sm:text-xs transition-colors duration-500"
                        style={{ color: lit ? color : "inherit" }}
                      >
                        {skill}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 w-full justify-center">
          <div className="enter-rise" style={delay(timing.actions)}>
            <SeeMore href="/projects" label="See all projects" />
          </div>
          <div className="enter-rise" style={delay(timing.actions + 120)}>
            <SeeMore href="/stack" label="All technologies" gradient="from-cyan-400 to-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
