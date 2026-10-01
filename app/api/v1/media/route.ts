import { guard, json } from "@/lib/api/http";
import { saveMedia } from "@/lib/content/files";
import { ContentError } from "@/lib/content/store";

export const dynamic = "force-dynamic";

/** Multipart field "file"; returns the /images/uploads/... path to put on a project. */
export function POST(request: Request) {
  return guard(async () => {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) throw new ContentError("validation", 'Send multipart field "file"');
    return json(await saveMedia(file), 201);
  });
}
