"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Blanket from "./blanket";
import { ProfileLinks } from "../link-icon";
import { cn } from "@/lib/utils";

const Footer = ({
  fullName,
  role,
  location,
  workArrangement,
  links,
  cvLabel,
}: {
  fullName: string;
  role: string;
  location: string;
  workArrangement: string;
  links: { label: string; href: string }[];
  cvLabel: string;
}) => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative w-full font-[family-name:var(--font-geist-sans)]",
        ["/cv", "/contact"].includes(pathname) && "hidden"
      )}
    >
      <Blanket />
      <div className="relative border-t border-white/10 bg-black/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="space-y-1">
            <p className="text-sm text-white/90">{fullName}</p>
            <p>
              {role} · {location} · {workArrangement}
            </p>
          </div>
          <div className="flex items-center gap-5">
            {/* Same icons as the contact card: learned once, recognised everywhere */}
            <ProfileLinks links={links} className="flex items-center gap-4 text-white/70" />
            <span aria-hidden className="h-4 w-px bg-white/15" />
            <Link href="/cv" className="hover:text-white underline-offset-4 hover:underline transition-colors">
              {cvLabel}
            </Link>
            <span className="text-white/40">© {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
