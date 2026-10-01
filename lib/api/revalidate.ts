import { revalidatePath } from "next/cache";

// Pages are prerendered. After a write, drop them so the next visit reads the new files.
export function refreshPages() {
  revalidatePath("/", "layout");
  revalidatePath("/cv.txt");
  revalidatePath("/llms.txt");
}
