"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KindFilter, allKinds, kindCounts, useKind } from "./kind-filter";
import { ProjectTile, type TileProject, type TileSize } from "./project-tile";
import { useFlip } from "./use-flip";
import { cn } from "@/lib/utils";

// Bento grid. The lead projects get the big tiles; a click opens a project in place, full width,
// and the others glide out of its way (useFlip). The URL follows (/projects/<id>) so an open project is shareable.
export function ProjectsGrid({
  projects,
  lead,
  initialOpen = null,
}: {
  projects: TileProject[];
  lead: number;
  initialOpen?: string | null;
}) {
  const counts = useMemo(() => kindCounts(projects), [projects]);
  const kindNames = useMemo(() => counts.map(([name]) => name), [counts]);
  const [kind, setKind] = useKind(kindNames);
  const [open, setOpen] = useState<string | null>(initialOpen);
  const grid = useRef<HTMLDivElement>(null);
  const { capture, settle } = useFlip(grid, `${kind}|${open}`);
  const opening = useRef(0);

  const shown = kind === allKinds ? projects : projects.filter((project) => project.kind === kind);

  const syncUrl = useCallback((id: string | null) => {
    const url = new URL(window.location.href);
    url.pathname = id ? `/projects/${id}` : "/projects";
    window.history.replaceState(null, "", url);
  }, []);

  // Lock the screen on the closed tile, then let it unfold.
  const openProject = (id: string) => {
    const ticket = ++opening.current;
    void settle(id).then(() => {
      if (ticket !== opening.current) return;
      capture(id);
      setOpen(id);
      syncUrl(id);
    });
  };

  const close = useCallback(() => {
    capture(open);
    setOpen(null);
    syncUrl(null);
  }, [capture, open, syncUrl]);

  const chooseKind = (next: string) => {
    capture();
    setKind(next);
  };

  // Arriving at /projects/<id>: bring the open project into view
  useEffect(() => {
    if (initialOpen) {
      document.getElementById(`project-${initialOpen}`)?.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [initialOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // A filter that hides the open project closes it
  useEffect(() => {
    if (open && !shown.some((project) => project.id === open)) close();
  }, [open, shown, close]);

  const sizes: TileSize[] = shown.map((project, index) => {
    if (project.id === open) return "open";
    if (kind !== allKinds || index >= lead) return "small";
    return index === 0 ? "hero" : index === 1 ? "wide" : "small";
  });
  const spans = evenRows(sizes, shown.map((project) => project.shape));

  return (
    <>
      <KindFilter
        counts={counts}
        kind={kind}
        onChange={chooseKind}
        sibling={{ href: "/stack", label: "Stack", tone: "stack", direction: "forward" }}
      />

      <div ref={grid} className="grid grid-flow-row-dense auto-rows-[280px] grid-cols-1 gap-4 [overflow-anchor:none] sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((project, index) => (
          <div
            key={project.id}
            id={`project-${project.id}`}
            data-flip={project.id}
            className={cn("enter-pop scroll-mt-28", spans[index])}
            style={{ "--delay": `${60 + index * 40}ms` } as CSSProperties}
          >
            <ProjectTile
              project={project}
              size={sizes[index]}
              index={index}
              onOpen={() => openProject(project.id)}
              onClose={close}
            />
          </div>
        ))}
      </div>
    </>
  );
}

// Column spans per breakpoint (sm: 2 columns, lg: 4) so the last row never has a hole:
// the leftover cells go to the last small tiles, widened just enough to fill it.
function evenRows(sizes: TileSize[], shapes: TileProject["shape"][]) {
  const wide = (size: TileSize) => size !== "small";
  const sm: number[] = sizes.map((size) => (wide(size) ? 2 : 1));
  const lg: number[] = sizes.map((size) => (size === "open" ? 4 : wide(size) ? 2 : 1));
  fill(sm, 2, 0);
  // A hero tile also covers the row below it on lg
  fill(lg, 4, sizes.includes("hero") ? 2 : 0);
  return sizes.map((size, index) =>
    cn(
      sm[index] === 2 && "sm:col-span-2",
      lg[index] === 1 && sm[index] === 2 && "lg:col-span-1",
      lg[index] === 2 && "lg:col-span-2",
      lg[index] === 4 && "lg:col-span-4",
      size === "hero" && "lg:row-span-2",
      // On phones an open project stacks viewer over details: phone screens need the extra row
      size === "open" && (shapes[index] === "portrait" ? "row-span-3 sm:row-span-2" : "row-span-2"),
    ),
  );
}

function fill(spans: number[], columns: number, extraCells: number) {
  const cells = spans.reduce((sum, span) => sum + span, 0) + extraCells;
  let empty = (columns - (cells % columns)) % columns;
  if (empty === 0) return;
  const smalls = spans.flatMap((span, index) => (span === 1 ? [index] : []));
  if (empty === columns - 1 && smalls.length > 0) {
    spans[smalls[smalls.length - 1]] = columns; // a lone tile takes the whole row
    return;
  }
  for (let i = smalls.length - 1; empty > 0 && i >= 0; i--) {
    spans[smalls[i]] = 2;
    empty -= 1;
  }
}
