import type { Tech } from "./schema";

/** The one order for technologies everywhere: by category, then as listed in content/techs.json. */
export const categoryOrder = ["Languages", "Frontend", "Backend & data", "Cloud & DevOps", "AI", "Mobile", "Desktop & audio", "Hardware", "Web3", "Design & tools"];

export function categoryRank(category: string | undefined) {
  const index = categoryOrder.indexOf(category ?? "Other");
  return index === -1 ? categoryOrder.length : index;
}

/** A project's stack ids, in the canonical order. Unknown ids go last, as they came. */
export function orderStack(ids: string[], techs: Tech[]) {
  const position = new Map(techs.map((tech, index) => [tech.id, index]));
  const byId = new Map(techs.map((tech) => [tech.id, tech]));
  const rank = (id: string) => {
    const tech = byId.get(id);
    return tech ? categoryRank(tech.category) * 1000 + (position.get(id) ?? 0) : Number.MAX_SAFE_INTEGER;
  };
  return [...ids].sort((a, b) => rank(a) - rank(b));
}
