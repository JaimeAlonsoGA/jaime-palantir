"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { accents } from "./ui/palette";
import { cn } from "@/lib/utils";

export const allKinds = "All";

/** The selected kind, kept in ?kind= so it survives a reload and travels between Projects and Stack. */
export function useKind(kinds: string[]) {
  const [kind, setKind] = useState(allKinds);

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("kind");
    if (wanted && kinds.includes(wanted)) setKind(wanted);
  }, [kinds]);

  const choose = (next: string) => {
    setKind(next);
    const url = new URL(window.location.href);
    if (next === allKinds) url.searchParams.delete("kind");
    else url.searchParams.set("kind", next);
    window.history.replaceState(null, "", url);
  };

  return [kind, choose] as const;
}

/**
 * Kind chips plus one link to the sibling page, dressed like that page's hero CTA.
 * Projects points forward to Stack (cool); Stack points back to Projects (warm).
 */
export function KindFilter({
  counts,
  kind,
  onChange,
  sibling,
}: {
  counts: [string, number][];
  kind: string;
  onChange: (kind: string) => void;
  sibling: { href: string; label: string; tone: "work" | "stack"; direction: "forward" | "back" };
}) {
  const total = counts.reduce((sum, [, count]) => sum + count, 0);
  const href = kind === allKinds ? sibling.href : `${sibling.href}?kind=${encodeURIComponent(kind)}`;
  const Arrow = sibling.direction === "forward" ? LuArrowRight : LuArrowLeft;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <div role="toolbar" aria-label="Filter by kind" className="flex flex-wrap gap-2">
        {[[allKinds, total] as [string, number], ...counts].map(([name, count]) => {
          const active = kind === name;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(name)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-colors",
                active
                  ? cn("bg-gradient-to-r text-white shadow-lg shadow-orange-500/20", accents.work)
                  : "bg-white/10 text-white/85 ring-1 ring-inset ring-white/15 hover:bg-white/15 hover:text-white",
              )}
            >
              {name}
              <span className={cn("font-mono text-xs", active ? "text-white/90" : "text-white/55")}>{count}</span>
            </button>
          );
        })}
      </div>
      <Link
        href={href}
        className={cn(
          "group rounded-full bg-gradient-to-r p-0.5 sm:ml-auto",
          accents[sibling.tone],
          sibling.direction === "back" && "bg-gradient-to-l",
        )}
      >
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-950 px-4 text-sm text-white transition-colors group-hover:bg-zinc-900">
          {sibling.direction === "back" ? (
            <Arrow aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          ) : null}
          {sibling.label}
          {sibling.direction === "forward" ? (
            <Arrow aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          ) : null}
        </span>
      </Link>
    </div>
  );
}

/** Project counts per kind, most common first. */
export function kindCounts(projects: { kind?: string }[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    if (project.kind) counts.set(project.kind, (counts.get(project.kind) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}
