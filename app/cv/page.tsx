import type { Metadata } from "next";
import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { Facts } from "@/components/facts";
import { JsonLd } from "@/components/json-ld";
import { ProfileLinks } from "@/components/link-icon";
import { PrintButton } from "@/components/print-button";
import { skillStyle } from "@/components/skill-icons";
import { Eyebrow, GradientPanel, PageShell, Panel, PillLink } from "@/components/ui/surface";
import { period } from "@/lib/content/format";
import { publishedProjects, readPortfolio, readTechs } from "@/lib/content/store";
import { profilePage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { person } = await readPortfolio();
  return {
    title: { absolute: `${person.fullName} · CV · ${person.role}` },
    description: `CV of ${person.fullName}, ${person.role} in ${person.location}. ${person.headline}`,
    alternates: { canonical: "/cv" },
  };
}

export default async function CvPage() {
  const [portfolio, techs] = await Promise.all([readPortfolio(), readTechs()]);
  const { person, site } = portfolio;
  const names = new Map(techs.map((tech) => [tech.id, tech.name]));
  const projects = publishedProjects(portfolio);

  return (
    <PageShell className="print-plain">
      <JsonLd data={profilePage(portfolio, "/cv", `${person.fullName} · CV`)} />
      <div className="mx-auto max-w-3xl space-y-5 print:space-y-6">
        <Panel as="article" className="enter-rise overflow-hidden p-3">
          <GradientPanel tone="stack" className="px-6 pb-7 pt-16 sm:px-8 sm:pt-20">
            <Eyebrow className="text-white/80">{person.role}</Eyebrow>
            <h1 className="mt-2 text-4xl font-medium leading-tight sm:text-5xl">
              {/* Keep the double surname on one line */}
              {person.fullName.replaceAll("-", "‑")}
            </h1>
            <p className="mt-4 max-w-xl text-white/90 leading-relaxed">{person.headline}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2 print:hidden">
              <PillLink href={`mailto:${person.email}`} arrow>Email me</PillLink>
              <PrintButton label="Save PDF" />
            </div>
            <p className="mt-4 hidden text-sm print:block">
              {person.email} · {person.links.filter((link) => !link.href.startsWith("mailto:")).map((link) => link.href.replace(/^https?:\/\/(www\.)?/, "")).join(" · ")}
            </p>
          </GradientPanel>
          <div className="flex flex-col gap-4 px-3 pb-2 pt-5 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <Facts person={person} />
            <ProfileLinks links={person.links} className="flex items-center justify-center gap-5 text-white/70 sm:pr-3" />
          </div>
        </Panel>

        <Panel className="enter-rise p-6 sm:p-8 [--delay:120ms]">
          <Eyebrow as="h2">Experience</Eyebrow>
          <div className="mt-5 space-y-7">
            {person.experience.map((job) => (
              <div key={`${job.company}-${job.start}`} className="print:break-inside-avoid">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-lg text-white">
                    {job.company} <span className="text-white/75">· {job.role}</span>
                  </h3>
                  <p className="font-mono text-xs text-white/70">{period(job)}</p>
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/90">
                  {job.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/60" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-5 md:grid-cols-5">
          <Panel className="enter-rise p-6 sm:p-8 md:col-span-3 [--delay:200ms]">
            <div className="flex items-center justify-between">
              <Eyebrow as="h2">Skills</Eyebrow>
              <Link
                href="/stack"
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 transition-colors hover:bg-white/20 hover:text-white print:hidden"
              >
                Stack
                <LuArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {person.skills.map((group) => (
                <ul key={group.group} aria-label={group.group} className="flex flex-wrap gap-1.5">
                  {group.items.map((skill) => {
                    const { Icon, color } = skillStyle(skill);
                    return (
                      <li key={skill} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.1] px-2.5 py-1 text-[13px] text-white/85">
                        {Icon ? <Icon aria-hidden className="h-3.5 w-3.5 print:hidden" style={{ color }} /> : null}
                        {skill}
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </Panel>

          <Panel className="enter-rise p-6 sm:p-8 md:col-span-2 [--delay:260ms]">
            <Eyebrow as="h2">Education</Eyebrow>
            {person.education.map((item) => (
              <div key={item.title} className="mt-4">
                <p className="text-sm text-white">{item.title}</p>
                <p className="mt-1 text-xs text-white/75">{item.school} · {item.year}</p>
              </div>
            ))}
            <Eyebrow as="h2" className="mt-7">Languages</Eyebrow>
            <ul className="mt-3 space-y-1.5 text-sm">
              {person.languages.map((language) => (
                <li key={language.name} className="flex justify-between text-white">
                  {language.name} <span className="text-white/75">{language.level}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel className="enter-rise p-6 sm:p-8 [--delay:320ms]">
          <Eyebrow as="h2">Projects</Eyebrow>
          <p className="mt-3 text-sm text-white/80">{site.projectsOverview}</p>
          <ul className="mt-5 divide-y divide-white/5">
            {projects.map((project) => (
              <li key={project.id} className="py-4 first:pt-0 last:pb-0 print:break-inside-avoid">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-white">
                    {project.title}
                    {project.year ? <span className="ml-2 font-mono text-xs text-white/60">{project.year}</span> : null}
                  </h3>
                  <div className="flex shrink-0 gap-3 text-xs">
                    {project.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-white/75 transition-colors hover:text-white"
                      >
                        {link.label}
                        <LuArrowUpRight aria-hidden className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-white/85">{project.summary}</p>
                <p className="mt-1.5 font-mono text-xs text-white/60">
                  {project.stack.map((id) => names.get(id) ?? id).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <p className="text-center text-xs print:hidden">
          <a href="/cv.txt" download="jaime-alonso-cv.txt" className="text-white/65 underline underline-offset-4 hover:text-white">
            cv.txt
          </a>
        </p>
      </div>
    </PageShell>
  );
}
