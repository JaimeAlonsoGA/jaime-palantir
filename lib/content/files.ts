import { ContentError } from "./store";
import { source } from "./source";

const types = new Map([
  ["image/webp", "webp"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

/** Saves an image under public/images/uploads (a commit in production) and returns its site path. */
export async function saveMedia(file: File) {
  const extension = types.get(file.type);
  if (!extension) {
    throw new ContentError("validation", "Use a webp, png, jpeg, gif, or avif image");
  }
  if (file.size > 8_000_000) {
    throw new ContentError("validation", "Images must stay under 8 MB");
  }
  const name = `${Date.now().toString(36)}-${crypto.randomUUID()}.${extension}`;
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  await source().commit([{ path: `public/images/uploads/${name}`, base64 }], `content: upload images/uploads/${name}`);
  return { path: `/images/uploads/${name}`, bytes: file.size, contentType: file.type };
}
