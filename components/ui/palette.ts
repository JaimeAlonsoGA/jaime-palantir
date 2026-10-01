// Colour carries meaning across the site, taken from the hero CTAs:
//   work    warm, like "See all projects", entering from blue: contact read backwards
//   stack   cool, like "All technologies" (cyan-400 → blue-600)
//   contact both at once: where your project meets my stack
// Card versions are pushed a little brighter than the CTAs so a large surface still glows.
export const gradients = {
  work: "linear-gradient(140deg, #2563eb -12%, #e11d48 38%, #f97316 72%, #ef4444 108%)",
  stack: "linear-gradient(140deg, #22d3ee -5%, #0ea5e9 35%, #2563eb 80%, #4f46e5 120%)",
  contact: "linear-gradient(140deg, #facc15 -10%, #f97316 22%, #ef4444 48%, #8b5cf6 78%, #22d3ee 112%)",
} as const;

// The CTA pairs themselves, for thin accents (Tailwind classes, same stops as the hero).
export const accents = {
  work: "from-yellow-500 to-red-500",
  stack: "from-cyan-400 to-blue-600",
} as const;

export type Tone = keyof typeof gradients;
