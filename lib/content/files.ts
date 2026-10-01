import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ContentError, publicRoot } from "./store";

const types = new Map([
  ["image/webp", "webp"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

export async function saveMedia(file: File) {
  const extension = types.get(file.type);
  if (!extension) {
    throw new ContentError("validation", "Use a webp, png, jpeg, gif, or avif image");
  }
  if (file.size > 8_000_000) {
    throw new ContentError("validation", "Images must stay under 8 MB");
  }
  const name = `${Date.now().toString(36)}-${crypto.randomUUID()}.${extension}`;
  const directory = path.join(publicRoot(), "images", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
  return { path: `/images/uploads/${name}`, bytes: file.size, contentType: file.type };
}
