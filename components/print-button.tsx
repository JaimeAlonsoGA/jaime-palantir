"use client";

import { LuPrinter } from "react-icons/lu";
import { pillClass } from "./ui/surface";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={pillClass("glass")}>
      <LuPrinter aria-hidden className="h-4 w-4" />
      {label}
    </button>
  );
}
