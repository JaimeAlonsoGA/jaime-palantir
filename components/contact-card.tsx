"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuLayers } from "react-icons/lu";
import { PixelSheep } from "./pixel-sheep";
import { CopyEmail } from "./copy-email";
import { Facts } from "./facts";
import { ProfileLinks } from "./link-icon";
import { Eyebrow, GradientPanel, Panel, PillLink, pillClass } from "./ui/surface";
import type { Person, Project } from "@/lib/content/schema";
import { city } from "@/lib/content/format";
import { cn } from "@/lib/utils";

type Featured = Pick<Project, "id" | "title" | "summary">;

// One card, two faces. The front is contact; "Featured work" turns it over to the
// developer card with the lead projects. #work in the URL opens it turned over.
export function ContactCard({
  person,
  title,
  cvLabel,
  featured,
}: {
  person: Person;
  title: string;
  cvLabel: string;
  featured: Featured[];
}) {
  const [flipped, setFlipped] = useState(false);
  const current = person.experience.find((job) => job.end === null);

  useEffect(() => {
    const sync = () => setFlipped(window.location.hash === "#work");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const turn = (next: boolean) => {
    setFlipped(next);
    const url = next ? "#work" : window.location.pathname;
    window.history.replaceState(null, "", url);
  };

  const header = (
    <header className="flex items-center justify-between px-6 pb-4 pt-5">
      <h1 className="text-lg font-light text-white">{person.name}</h1>
      <ProfileLinks links={person.links} className="flex items-center gap-4 text-white/80" />
    </header>
  );

  const face = "[grid-area:1/1] [backface-visibility:hidden] flex flex-col overflow-hidden";

  return (
    <div className="enter-rise w-full max-w-md [perspective:1800px]">
      <div
        className={cn(
          "grid transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] will-change-transform [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        <Panel as="article" className={face} inert={flipped} aria-hidden={flipped}>
          {header}
          <GradientPanel
            tone="contact"
            className="mx-3 flex-1 px-5 pb-6 pt-6 sm:px-6"
            contentClassName="flex h-full flex-col"
          >
            {/* The sheep gets the whole upper field, edge to edge */}
            <div className="relative -mx-5 -mt-6 mb-2 min-h-[190px] flex-1 sm:-mx-6">
              <PixelSheep />
            </div>
            <h2 className="text-4xl font-medium leading-tight">{title}</h2>
            <p className="mt-3 font-mono text-sm text-white/90">{person.email}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <PillLink href={`mailto:${person.email}`} arrow>Email me</PillLink>
              <CopyEmail email={person.email} />
            </div>
          </GradientPanel>
          <div className="px-3 pb-3 pt-5">
            <Facts person={person} />
            <button type="button" onClick={() => turn(true)} className={cn(pillClass("glass"), "mt-5 w-full justify-center")}>
              <LuLayers aria-hidden className="h-4 w-4" />
              Featured work
            </button>
          </div>
        </Panel>

        <Panel
          as="article"
          className={cn(face, "[transform:rotateY(180deg)]")}
          inert={!flipped}
          aria-hidden={!flipped}
        >
          {header}
          <GradientPanel tone="work" className="mx-3 px-6 pb-6 pt-14">
            <Eyebrow className="text-white/90">
              {city(person.location)} · {person.workArrangement}
            </Eyebrow>
            <h2 className="mt-2 text-4xl font-medium leading-tight">{person.role}</h2>
            {current ? (
              <p className="mt-2 text-sm text-white/90">
                {current.role} at {current.company}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => turn(false)} className={pillClass("solid")}>
                <LuArrowLeft aria-hidden className="h-4 w-4" />
                Contact
              </button>
              <PillLink href="/cv" variant="glass">{cvLabel}</PillLink>
            </div>
          </GradientPanel>
          <nav aria-label="Featured work" className="flex-1 px-3 py-3">
            <ul>
              {featured.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="group flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-white/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white">{project.title}</p>
                      <p className="truncate text-xs text-white/65">{project.summary}</p>
                    </div>
                    <LuArrowRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-white/45 transition-all group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Panel>
      </div>
    </div>
  );
}
