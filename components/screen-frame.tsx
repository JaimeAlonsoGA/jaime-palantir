import type { CSSProperties } from "react";
import { MediaFill } from "./media-fill";
import { cn } from "@/lib/utils";

/**
 * A screenshot in a window: the desktop/web counterpart of the phone bezels in the mobile
 * screenshots, so every project image reads the same way. `ratio` is the image's width/height.
 */
export function ScreenFrame({
  src,
  ratio,
  alt,
  sizes,
  blur,
  priority,
  fit = "cover",
  className,
  style,
}: {
  src: string;
  ratio: number;
  alt: string;
  sizes: string;
  blur?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-zinc-900 shadow-2xl shadow-black/70 ring-1 ring-white/15",
        className,
      )}
      style={style}
    >
      <div aria-hidden className="flex h-6 shrink-0 items-center gap-1.5 bg-zinc-800/95 px-3">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      <div className="relative min-h-0 flex-1" style={{ aspectRatio: ratio }}>
        <MediaFill
          src={src}
          alt={alt}
          sizes={sizes}
          blur={blur}
          priority={priority}
          className={fit === "cover" ? "object-cover object-top" : "object-contain"}
        />
      </div>
    </div>
  );
}
