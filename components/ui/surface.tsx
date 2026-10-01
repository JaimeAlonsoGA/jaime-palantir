import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { LuArrowRight } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { accents, gradients, type Tone } from "./palette";

// The portfolio's design system: dark glass surfaces, small caps labels, pill actions
// and one gradient panel. Contact, Card, CV and Stack are built only from these.

/**
 * Full-screen page frame: dims the nebula so surfaces read well.
 * A plain veil, no backdrop blur: the nebula moves, and a page-sized blur would be redrawn every frame.
 */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-screen w-full bg-black/70 px-5 pb-24 pt-28 sm:px-8 sm:pt-32", className)}>
      {children}
    </div>
  );
}

/** The base card. Extra props (id, inert, aria-*) pass through. */
export function Panel({
  children,
  className,
  as: Tag = "section",
  ...rest
}: { as?: "section" | "article" | "div" } & Omit<ComponentProps<"section">, "ref">) {
  return (
    <Tag className={cn("rounded-3xl border border-white/15 bg-zinc-950/90 shadow-2xl shadow-black/60", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** The bright inner panel with a faint grid that fades out downwards. */
export function GradientPanel({
  children,
  tone = "contact",
  className,
  contentClassName,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  /** Layout for the content layer above the grid, e.g. a flex column. */
  contentClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl text-white", className)} style={{ backgroundImage: gradients[tone] }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  );
}

/** Thin CTA-coloured line along the top edge of a Panel (the Panel needs `relative overflow-hidden`). */
export function AccentLine({ tone }: { tone: keyof typeof accents }) {
  return <div aria-hidden className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r", accents[tone])} />;
}

/** Small caps section label. */
export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "h2" | "h3";
}) {
  return <Tag className={cn("text-xs font-medium uppercase tracking-[0.18em] text-white/75", className)}>{children}</Tag>;
}

/** Compact mono tag, optionally a link. */
export function Chip({ children, href, title }: { children: ReactNode; href?: string; title?: string }) {
  const style = "rounded-md bg-white/[0.12] px-2 py-0.5 font-mono text-xs text-white/90";
  if (!href) return <span className={style}>{children}</span>;
  return (
    <Link href={href} title={title} className={cn(style, "transition-colors hover:bg-white/25 hover:text-white")}>
      {children}
    </Link>
  );
}

const pills = {
  solid: "bg-zinc-950/85 text-white hover:bg-zinc-950",
  // Reads on both the dark panels and the bright gradients
  glass: "bg-black/25 text-white ring-1 ring-inset ring-white/25 hover:bg-black/35",
};

/** Rounded action. Internal paths use next/link; the rest are plain anchors. */
export function PillLink({
  href,
  children,
  variant = "solid",
  arrow = false,
  className,
  ...rest
}: { href: string; variant?: keyof typeof pills; arrow?: boolean } & Omit<ComponentProps<"a">, "href">) {
  const style = cn(
    "inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm transition-colors",
    pills[variant],
    className,
  );
  const content = (
    <>
      {children}
      {arrow ? <LuArrowRight aria-hidden className="h-4 w-4" /> : null}
    </>
  );
  if (href.startsWith("/") && !href.includes(".")) {
    return <Link href={href} className={style}>{content}</Link>;
  }
  return <a href={href} className={style} {...rest}>{content}</a>;
}

export const pillClass = (variant: keyof typeof pills = "solid") =>
  cn("inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm transition-colors", pills[variant]);
