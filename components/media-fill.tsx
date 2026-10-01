import Image from "next/image";

/**
 * An image that fills its (positioned) parent. Local files go through next/image, so they
 * are resized to `sizes` and served as AVIF/WebP; external URLs stay a plain img.
 */
export function MediaFill({
  src,
  alt,
  sizes,
  blur,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  /** How wide the image is drawn, as an HTML `sizes` value. Be honest: it decides the download. */
  sizes: string;
  /** Blurred stand-in from blurPlaceholder(), shown while the image loads. */
  blur?: string;
  className?: string;
  priority?: boolean;
}) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur}
        className={className}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
}
