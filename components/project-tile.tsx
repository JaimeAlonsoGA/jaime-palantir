"use client";

import { useRef, useState } from "react";
import { LuArrowUpRight, LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import { linkIcon } from "./link-icon";
import { MediaFill } from "./media-fill";
import { ScreenFrame } from "./screen-frame";
import { gradients } from "./ui/palette";
import { iconFor, readableColor } from "./tech-icons";
import { type Shape, shapeOf } from "@/lib/content/shape";
import type { Project, Tech } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

export type TileProject = Pick<Project, "id" | "title" | "summary" | "kind" | "year" | "links"> & {
  images: string[];
  /** Blurred stand-ins by image src */
  blurs: Record<string, string>;
  /** width / height by image src */
  ratios: Record<string, number>;
  video: string | null;
  /** From the first image; "none" when there are no screenshots */
  shape: Shape | "none";
  stack: Tech[];
};

export type TileSize = "hero" | "wide" | "small" | "open";

/** Collapsed: a cover with the essentials. Open: an image viewer and the full details, in place. */
export function ProjectTile({
  project,
  size,
  index,
  onOpen,
  onClose,
}: {
  project: TileProject;
  size: TileSize;
  index: number;
  onOpen: () => void;
  onClose: () => void;
}) {
  return size === "open" ? (
    <Expanded project={project} onClose={onClose} />
  ) : (
    <Collapsed project={project} size={size} priority={index < 2} onOpen={onOpen} />
  );
}

function Meta({ project }: { project: TileProject }) {
  return (
    <p className="flex gap-2 text-[11px] font-medium uppercase tracking-[0.18em]">
      {project.kind ? <span className="text-amber-300">{project.kind}</span> : null}
      {project.year ? <span className="font-mono tracking-normal text-white/70">{project.year}</span> : null}
    </p>
  );
}

function Collapsed({
  project,
  size,
  priority,
  onOpen,
}: {
  project: TileProject;
  size: Exclude<TileSize, "open">;
  priority: boolean;
  onOpen: () => void;
}) {
  const big = size === "hero";
  return (
    <article
      className={cn(
        "group relative isolate h-full overflow-hidden rounded-3xl border border-white/15 bg-zinc-950 shadow-2xl shadow-black/50",
        "transition-[border-color] duration-300 hover:border-white/35",
      )}
    >
      <Cover project={project} size={size} priority={priority} />

      {/* Legibility: the lower half fades to black under the text */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black from-20% via-black/80 via-45% to-transparent to-75%" />

      {/* The whole tile is the link: a real href for crawlers and new tabs, a plain click opens it in place */}
      <a
        href={`/projects/${project.id}`}
        aria-label={project.title}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          onOpen();
        }}
        className="absolute inset-0 z-10 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
        <Meta project={project} />
        <h2 className={cn("mt-1 font-medium text-white", big ? "text-3xl sm:text-4xl" : "text-xl")}>{project.title}</h2>
        <p className={cn("mt-1.5 text-sm leading-relaxed text-white/85", big ? "line-clamp-2 max-w-lg" : "line-clamp-1")}>
          {project.summary}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <StackIcons stack={project.stack} max={big ? 7 : 5} />
          <LuArrowUpRight
            aria-hidden
            className="ml-auto h-5 w-5 text-white/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          />
        </div>
      </div>

      {project.links.length > 0 ? (
        <nav aria-label={`${project.title} links`} className="absolute right-4 top-4 z-20 flex gap-1.5">
          {project.links.map((link) => {
            const Icon = linkIcon(link.url);
            return (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                title={link.label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white/85 ring-1 ring-inset ring-white/20 transition-colors hover:bg-black/80 hover:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </nav>
      ) : null}
    </article>
  );
}

/** The first few stack icons, then "+N" for the rest (they are all in the open project). */
function StackIcons({ stack, max }: { stack: Tech[]; max: number }) {
  const withIcons = stack.filter((tech) => iconFor(tech.id));
  const shown = withIcons.slice(0, max);
  const hidden = stack.length - shown.length;
  return (
    <ul aria-label="Stack" className="flex items-center gap-2.5">
      {shown.map((tech) => {
        const Icon = iconFor(tech.id)!;
        return (
          <li key={tech.id} title={tech.name}>
            <Icon aria-label={tech.name} className="h-4 w-4" style={{ color: readableColor(tech.color) }} />
          </li>
        );
      })}
      {hidden > 0 ? (
        <li
          title={stack.slice(shown.length).map((tech) => tech.name).join(", ")}
          className="rounded-md bg-white/15 px-1.5 py-px font-mono text-[11px] text-white/90"
        >
          +{hidden}
        </li>
      ) : null}
    </ul>
  );
}

// Drawn width per tile size, for the cover's `sizes`
const tileSizes: Record<Exclude<TileSize, "open">, string> = {
  hero: "(min-width: 1024px) 640px, (min-width: 640px) 100vw, 100vw",
  wide: "(min-width: 1024px) 640px, (min-width: 640px) 100vw, 100vw",
  small: "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw",
};

function Cover({ project, size, priority }: { project: TileProject; size: Exclude<TileSize, "open">; priority: boolean }) {
  const zoom = "transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]";
  const [cover] = project.images;
  if (!cover) return <StackCover stack={project.stack} />;

  const wash = (
    <div aria-hidden className="absolute inset-0 scale-125 opacity-60 blur-2xl">
      {/* Blurred to nothing anyway: the smallest rendition is plenty */}
      <MediaFill src={cover} alt="" sizes="64px" className="object-cover" />
    </div>
  );

  // Screens: one window, floating over a blurred wash of itself
  if (project.shape === "landscape") {
    return (
      // A size container: the window's width follows the tile's height too, so a wide tile still shows the screen
      <div className="absolute inset-0 [container-type:size]">
        {wash}
        <div className={cn("absolute inset-x-0 top-5 flex justify-center", zoom)}>
          <ScreenFrame
            src={cover}
            ratio={project.ratios[cover]}
            alt=""
            sizes={tileSizes[size]}
            blur={project.blurs[cover]}
            priority={priority}
            style={{ width: `min(${size === "hero" ? 84 : 86}cqw, calc(105cqh * ${project.ratios[cover]}))` }}
          />
        </div>
      </div>
    );
  }

  // Phone screenshots: a row of screens over the same wash
  const screens = project.images.filter((src) => shapeOf(project.ratios[src]) === "portrait").slice(0, size === "small" ? 2 : 3);
  return (
    <div className="absolute inset-0">
      {wash}
      <div className={cn("absolute inset-x-0 top-4 flex justify-center gap-3", size === "hero" ? "h-[60%]" : "h-[46%]", zoom)}>
        {screens.map((src, index) => (
          <div
            key={src}
            className={cn(
              "relative aspect-[9/16] h-full overflow-hidden rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/15",
              screens.length === 3 && index !== 1 && "mt-4 h-[92%]",
            )}
          >
            <MediaFill src={src} alt="" sizes="180px" blur={project.blurs[src]} priority={priority && index === 0} className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** No screenshots: the warm projects gradient with the stack, in the contact card's tiles. */
function StackCover({ stack, large = false }: { stack: Tech[]; large?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: gradients.work }}>
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <ul className={cn("absolute inset-x-0 flex justify-center gap-3", large ? "top-1/2 -translate-y-1/2" : "top-10")}>
        {stack.slice(0, 4).map((tech) => {
          const Icon = iconFor(tech.id);
          return Icon ? (
            <li key={tech.id} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/20 text-white ring-1 ring-inset ring-white/35">
              <Icon aria-label={tech.name} className="h-6 w-6" />
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}

function Expanded({ project, onClose }: { project: TileProject; onClose: () => void }) {
  return (
    <article
      aria-label={project.title}
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-zinc-950 shadow-2xl shadow-black/60 sm:flex-row"
    >
      <Viewer project={project} />

      {/* Details keep their full size; the viewer takes whatever is left */}
      <div className="enter-fade flex shrink-0 flex-col [--delay:220ms] p-5 sm:w-[300px] sm:overflow-y-auto sm:p-6 lg:w-[380px] lg:p-7">
        <Meta project={project} />
        <h2 className="mt-1.5 pr-10 text-3xl font-medium text-white">{project.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/85">{project.summary}</p>

        {project.stack.length > 0 ? (
          <ul aria-label="Stack" className="mt-5 flex flex-wrap gap-1.5">
            {project.stack.map((tech) => {
              const Icon = iconFor(tech.id);
              return (
                <li key={tech.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white/90">
                  {Icon ? <Icon aria-hidden className="h-3.5 w-3.5" style={{ color: readableColor(tech.color) }} /> : null}
                  {tech.name}
                </li>
              );
            })}
          </ul>
        ) : null}

        {project.links.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            {project.links.map((link) => {
              const Icon = linkIcon(link.url);
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-white/85"
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {link.label}
                </a>
              );
            })}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-black/85"
      >
        <LuX className="h-4 w-4" />
      </button>
    </article>
  );
}

/** Horizontal, snap-scrolling strip of every image, then the video if there is one. */
function Viewer({ project }: { project: TileProject }) {
  const strip = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const slides = project.images.length + (project.video ? 1 : 0);

  const update = () => {
    const node = strip.current;
    if (!node) return;
    setAtStart(node.scrollLeft < 8);
    setAtEnd(node.scrollLeft + node.clientWidth > node.scrollWidth - 8);
  };
  const move = (direction: 1 | -1) => strip.current?.scrollBy({ left: direction * strip.current.clientWidth * 0.8, behavior: "smooth" });

  // Phone screens sit side by side; screens get their window, as large as the viewer allows
  return (
    <div className="relative min-h-0 flex-1 basis-0 bg-black/60 sm:min-w-0 sm:basis-auto">
      {slides === 0 ? <StackCover stack={project.stack} large /> : null}
      <div
        ref={strip}
        onScroll={update}
        className="scrollbar-hide flex h-full snap-x snap-mandatory gap-3 overflow-x-auto p-3 sm:p-4"
      >
        {project.images.map((src, index) => {
          const ratio = project.ratios[src];
          const alt = `${project.title}, image ${index + 1}`;
          if (shapeOf(ratio) === "portrait") {
            return (
              <div key={src} className="relative aspect-[9/16] h-full max-w-full shrink-0 snap-center overflow-hidden rounded-2xl bg-zinc-900">
                <MediaFill src={src} alt={alt} sizes="320px" blur={project.blurs[src]} priority={index === 0} className="object-cover object-top" />
              </div>
            );
          }
          return (
            // A size container, so the window can fit both the width and the height of the viewer
            <div key={src} className="flex h-full w-full shrink-0 snap-center items-center justify-center [container-type:size]">
              <ScreenFrame
                src={src}
                ratio={ratio}
                alt={alt}
                sizes="(min-width: 1024px) 70vw, 100vw"
                blur={project.blurs[src]}
                priority={index === 0}
                fit="contain"
                style={{ width: `min(100cqw, calc((100cqh - 24px) * ${ratio}))` }}
              />
            </div>
          );
        })}
        {project.video ? (
          <div className="relative h-full w-full shrink-0 snap-center overflow-hidden rounded-2xl bg-zinc-900">
            <iframe
              src={project.video}
              title={`${project.title} video`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : null}
      </div>

      {slides > 1 ? (
        <>
          <ViewerButton label="Previous image" onClick={() => move(-1)} hidden={atStart} side="left" />
          <ViewerButton label="Next image" onClick={() => move(1)} hidden={atEnd} side="right" />
        </>
      ) : null}
    </div>
  );
}

function ViewerButton({ label, onClick, hidden, side }: { label: string; onClick: () => void; hidden: boolean; side: "left" | "right" }) {
  const Icon = side === "left" ? LuChevronLeft : LuChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      tabIndex={hidden ? -1 : 0}
      className={cn(
        "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white ring-1 ring-inset ring-white/25 transition-opacity hover:bg-black/85",
        side === "left" ? "left-5" : "right-5",
        hidden ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
