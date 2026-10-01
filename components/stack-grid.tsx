"use client";

import { useMemo } from "react";
import { KindFilter, allKinds, kindCounts, useKind } from "./kind-filter";
import { iconFor, readableColor } from "./tech-icons";
import { AccentLine, Chip, Eyebrow, Panel } from "./ui/surface";
import type { Project, Tech } from "@/lib/content/schema";
import { categoryRank } from "@/lib/content/stack-order";


type StackProject = Pick<Project, "id" | "title" | "kind" | "stack">;

// Each technology with the projects that use it. The kind filter matches /projects:
// "App" leaves only what the apps were built with.
export function StackGrid({ techs, projects }: { techs: Tech[]; projects: StackProject[] }) {
  const counts = useMemo(() => kindCounts(projects), [projects]);
  const kindNames = useMemo(() => counts.map(([name]) => name), [counts]);
  const [kind, setKind] = useKind(kindNames);

  const cards = useMemo(() => {
    const pool = kind === allKinds ? projects : projects.filter((project) => project.kind === kind);
    const used = techs
      .map((tech) => ({ tech, projects: pool.filter((project) => project.stack.includes(tech.id)) }))
      .filter((entry) => entry.projects.length > 0)
      .sort((a, b) => b.projects.length - a.projects.length);

    const groups = new Map<string, typeof used>();
    for (const entry of used) {
      const category = entry.tech.category ?? "Other";
      groups.set(category, [...(groups.get(category) ?? []), entry]);
    }
    return [...groups.entries()].sort(([a], [b]) => categoryRank(a) - categoryRank(b));
  }, [kind, projects, techs]);

  return (
    <>
      <KindFilter
        counts={counts}
        kind={kind}
        onChange={setKind}
        sibling={{ href: "/projects", label: "Projects", tone: "work", direction: "back" }}
      />
      <div key={kind} className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {cards.map(([category, entries], cardIndex) => (
          <Panel
            key={category}
            className="enter-pop relative mb-5 break-inside-avoid overflow-hidden rounded-2xl border-white/20 bg-zinc-950 p-5 sm:p-6"
            style={{ "--delay": `${cardIndex * 50}ms` } as React.CSSProperties}
          >
            <AccentLine tone="stack" />
            <Eyebrow as="h2" className="mb-4 text-white/80">{category}</Eyebrow>
            <ul className="divide-y divide-white/15">
              {entries.map(({ tech, projects: usedIn }) => {
                const Icon = iconFor(tech.id);
                const color = readableColor(tech.color);
                return (
                  <li key={tech.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10" style={{ color }}>
                      {Icon ? <Icon aria-hidden className="h-[18px] w-[18px]" /> : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex h-8 items-center">
                        <span className="text-base font-medium text-white">{tech.name}</span>
                        <span className="ml-auto font-mono text-xs text-white/70">{usedIn.length}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {usedIn.map((project) => (
                          <Chip key={project.id} href={`/projects/${project.id}`} title={project.title}>
                            @{project.id}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}
