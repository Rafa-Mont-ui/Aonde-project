import { revalidatePath } from "next/cache"

/**
 * The app's screens are statically generated with the museum list baked in,
 * so CMS changes must purge them. Outside a Next.js request (seed, migrate,
 * other CLI scripts) there is no cache to purge, and revalidatePath throws.
 */
export function revalidateSite() {
  try {
    revalidatePath("/", "layout")
  } catch {
    // Not running inside Next.js.
  }
}
