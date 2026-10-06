import { revalidatePath } from "next/cache";
import { source } from "../content/source";

// Pages are prerendered. After a local write, drop them so the next visit reads the new files.
// In production the write is a commit, and the deploy it triggers rebuilds every page.
export function refreshPages() {
  if (source().kind === "github") return;
  revalidatePath("/", "layout");
  revalidatePath("/cv.txt");
  revalidatePath("/llms.txt");
}
