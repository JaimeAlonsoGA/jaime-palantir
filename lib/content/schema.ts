import { z } from "zod";

const hrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) =>
      value.startsWith("/") ||
      value.startsWith("mailto:") ||
      URL.canParse(value),
    "Expected an absolute URL, a mailto link, or a site path",
  );

export const linkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  href: hrefSchema,
}).strict();

export const projectLinkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: hrefSchema,
}).strict();

export const projectStatusSchema = z.enum(["published", "draft", "archived"]);

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9][a-z0-9-]{0,63}$/, "Use a lowercase slug")
  .refine((value) => value !== "order", "\"order\" is reserved by /api/v1/projects/order");

const techIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .refine((value) => !value.includes("/") && !value.includes(".."), "Invalid tech id");

const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");

const experienceSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  start: monthSchema,
  end: monthSchema.nullable(),
  points: z.array(z.string().trim().min(1).max(400)).min(1).max(8),
}).strict();

const skillGroupSchema = z.object({
  group: z.string().trim().min(1).max(60),
  items: z.array(z.string().trim().min(1).max(40)).min(1).max(16),
}).strict();

const educationSchema = z.object({
  title: z.string().trim().min(1).max(160),
  school: z.string().trim().min(1).max(160),
  year: z.number().int().min(1950).max(2100),
}).strict();

const languageSchema = z.object({
  name: z.string().trim().min(1).max(40),
  level: z.string().trim().min(1).max(40),
}).strict();

export const personSchema = z.object({
  name: z.string().trim().min(1).max(80),
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  role: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(120),
  workArrangement: z.string().trim().min(1).max(80),
  headline: z.string().trim().min(1).max(300),
  links: z.array(linkSchema).max(12),
  experience: z.array(experienceSchema).max(12),
  skills: z.array(skillGroupSchema).max(6),
  education: z.array(educationSchema).max(8),
  languages: z.array(languageSchema).max(8),
}).strict();

export const projectSchema = z.object({
  id: slugSchema,
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(500),
  // What it is, one word: "App", "Web", "Tool", "Plugin", "CLI", "Hardware". Filters /projects.
  kind: z.string().trim().min(1).max(40).optional(),
  // Year it was built. Leave it out rather than guess.
  year: z.number().int().min(2000).max(2100).optional(),
  status: projectStatusSchema.default("published"),
  stack: z.array(techIdSchema).max(24),
  links: z.array(projectLinkSchema).max(8),
  media: z.object({
    // Screenshots only. None is fine: the site draws a cover from the stack instead.
    images: z.array(z.string().trim().min(1).max(500)).max(24),
    video: z.preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      z.string().trim().min(1).max(500).nullable(),
    ),
  }).strict(),
}).strict();

export const siteSchema = z.object({
  locale: z.string().trim().min(2).max(12),
  // Canonical origin for SEO: metadata, sitemap and structured data.
  siteUrl: z.string().trim().url(),
  cvLabel: z.string().trim().min(1).max(40),
  projectsTitle: z.string().trim().min(1).max(80),
  projectsOverview: z.string().trim().min(1).max(300),
  heroTagline: z.string().trim().min(1).max(160),
  stackTitle: z.string().trim().min(1).max(80),
  contactTitle: z.string().trim().min(1).max(60),
}).strict();

export const portfolioSchema = z.object({
  person: personSchema,
  site: siteSchema,
  projects: z.array(projectSchema).max(200),
  updatedAt: z.string().datetime(),
}).strict().superRefine((portfolio, context) => {
  const seen = new Set<string>();
  portfolio.projects.forEach((project, index) => {
    if (seen.has(project.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["projects", index, "id"],
        message: `Duplicate project id \"${project.id}\"`,
      });
    }
    seen.add(project.id);
  });
});

export const indexSchema = z.object({
  updatedAt: z.string().datetime(),
  lead: z.number().int().min(1).max(12),
  projectIds: z.array(z.string().trim().min(1)).max(200),
}).strict();

export const techSchema = z.object({
  id: techIdSchema,
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  // Groups the /stack page. Missing means "Other".
  category: z.string().trim().min(1).max(40).optional(),
}).strict();

export const techsSchema = z.array(techSchema).max(80).superRefine((techs, context) => {
  const seen = new Set<string>();
  techs.forEach((tech, index) => {
    if (seen.has(tech.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, "id"],
        message: `Duplicate tech id \"${tech.id}\"`,
      });
    }
    seen.add(tech.id);
  });
});

export const projectPatchSchema = projectSchema.omit({ id: true }).partial();

export type Project = z.infer<typeof projectSchema>;
export type Person = z.infer<typeof personSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type SiteCopy = z.infer<typeof siteSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
export type Tech = z.infer<typeof techSchema>;
