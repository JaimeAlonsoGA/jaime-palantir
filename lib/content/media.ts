import path from "node:path";
import sharp from "sharp";
import { publicRoot } from "./store";

const ratios = new Map<string, number>();

/** width / height of a local image; external URLs count as 16:9. */
export async function imageRatio(src: string): Promise<number> {
  if (!src.startsWith("/")) return 16 / 9;
  const known = ratios.get(src);
  if (known) return known;
  try {
    const { width = 16, height = 9 } = await sharp(path.join(publicRoot(), src)).metadata();
    const ratio = width / height;
    ratios.set(src, ratio);
    return ratio;
  } catch {
    return 16 / 9;
  }
}

const blurs = new Map<string, string>();

/** A tiny blurred stand-in (a few hundred bytes) shown until the real image lands. Local files only. */
export async function blurPlaceholder(src: string): Promise<string | undefined> {
  if (!src.startsWith("/")) return undefined;
  const known = blurs.get(src);
  if (known) return known;
  try {
    const tiny = await sharp(path.join(publicRoot(), src)).resize(12).webp({ quality: 40 }).toBuffer();
    const data = `data:image/webp;base64,${tiny.toString("base64")}`;
    blurs.set(src, data);
    return data;
  } catch {
    return undefined;
  }
}
