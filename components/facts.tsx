import type { Person } from "@/lib/content/schema";
import { city, languageCode } from "@/lib/content/format";

/** Three-cell strip: where, how and which languages. */
export function Facts({ person }: { person: Person }) {
  const facts = [
    { label: "Based in", value: city(person.location) },
    { label: "Work", value: person.workArrangement },
    { label: "Speaks", value: person.languages.map((language) => languageCode(language.name)).join(" · ") },
  ];
  return (
    <dl className="grid grid-cols-3 divide-x divide-white/10">
      {facts.map((fact) => (
        <div key={fact.label} className="px-3 text-center">
          <dt className="text-[11px] uppercase tracking-[0.18em] text-white/70">{fact.label}</dt>
          <dd className="mt-1.5 text-sm text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
