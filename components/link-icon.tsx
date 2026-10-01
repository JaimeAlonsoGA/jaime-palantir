import type { IconType } from "react-icons/lib";
import { FaApple, FaGithub, FaGooglePlay, FaLinkedin } from "react-icons/fa";
import { LuGlobe, LuLink, LuMail } from "react-icons/lu";

export function linkIcon(href: string): IconType {
  if (href.startsWith("mailto:")) return LuMail;
  if (href.includes("github.com")) return FaGithub;
  if (href.includes("linkedin.com")) return FaLinkedin;
  if (href.includes("play.google.com")) return FaGooglePlay;
  if (href.includes("apps.apple.com")) return FaApple;
  if (/^https?:/.test(href)) return LuGlobe;
  return LuLink;
}

/** Row of icon links for a person's profiles. */
export function ProfileLinks({ links, className }: { links: { label: string; href: string }[]; className?: string }) {
  return (
    <nav aria-label="Profiles" className={className ?? "flex items-center gap-4 text-white/70"}>
      {links.map((link) => {
        const Icon = linkIcon(link.href);
        const external = /^https?:/.test(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            aria-label={link.label}
            title={link.label}
            className="transition-colors hover:text-white"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </nav>
  );
}
