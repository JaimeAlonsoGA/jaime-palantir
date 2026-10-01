"use client";

import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy ${email}`}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white transition-colors hover:bg-black/40"
    >
      {copied ? <LuCheck className="h-4 w-4" /> : <LuCopy className="h-4 w-4" />}
    </button>
  );
}
