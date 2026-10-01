"use client";

import Arrow from "./arrow";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const Header = ({ role, cvLabel }: { role: string; cvLabel: string }) => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Only a first visit to the home page waits for the hero; later navigations show the header at once.
  const [introOnHome] = useState(isHome);

  return (
    <header
      className={cn(
        "fixed backdrop-blur-lg z-50 w-full top-0 print:hidden",
        "flex flex-row justify-around sm:justify-between items-center px-4 sm:px-8 py-4",
        "font-[family-name:var(--font-geist-sans)]",
        "bg-black/10 border-b border-white/10 shadow-sm gap-4",
        introOnHome && "enter-fade [--delay:2.3s]",
      )}
    >
      {isHome && (
        <p className="hidden sm:flex items-center gap-2 text-sm font-light text-white/90">
          {role}
        </p>
      )}
      <Arrow isHome={isHome} />
      <nav className="flex items-center gap-4 sm:gap-6">
        {[
          ["/projects", "Projects"],
          ["/stack", "Stack"],
          ["/cv", cvLabel],
          ["/contact", "Contact"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-white/90 font-light text-sm",
              "hover:text-white hover:underline hover:underline-offset-4",
              "transition-all duration-300",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
