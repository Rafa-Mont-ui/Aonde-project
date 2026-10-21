/**
 * Local starter data: uploads each museum's photos to Media and creates the
 * Curitiba museums listed in src/seed-museums.ts. Safe to run more than once;
 * existing museums only get missing coordinates filled in.
 *
 *   pnpm seed
 */
import path from "path"
import { getPayload } from "payload"
import config from "@payload-config"
import type { Media } from "./payload-types"
import { museums } from "./seed-museums"

const payload = await getPayload({ config })

// Shared cover for museums without a free photo yet; created on first use.
let placeholder: Media | undefined
async function placeholderCover() {
  if (!placeholder) {
    const alt = "Ilustração: este museu ainda não tem foto"
    const existing = await payload.find({
      collection: "media",
      where: { alt: { equals: alt } },
      limit: 1,
      overrideAccess: true,
    })
    placeholder =
      existing.docs[0] ??
      (await payload.create({
        collection: "media",
        data: { alt },
        filePath: path.resolve(process.cwd(), "src/seed-photos/sem-foto.jpg"),
        overrideAccess: true,
      }))
  }
  return placeholder
}

for (const { photos, ...museum } of museums) {
  const existing = await payload.find({
    collection: "museums",
    where: { slug: { equals: museum.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const found = existing.docs[0]
  if (found) {
    // Only fill coordinates that are still empty, so admin edits are kept.
    if (found.latitude == null && found.longitude == null && museum.latitude != null) {
      await payload.update({
        collection: "museums",
        id: found.id,
        data: { latitude: museum.latitude, longitude: museum.longitude },
        overrideAccess: true,
      })
      payload.logger.info(`Added coordinates to ${museum.name}`)
    } else {
      payload.logger.info(`Skipping ${museum.name} (already exists)`)
    }
    continue
  }

  // One upload at a time: SQLite allows a single writer.
  const uploaded = []
  for (const { file, ...data } of photos) {
    uploaded.push(
      await payload.create({
        collection: "media",
        data,
        filePath: path.resolve(process.cwd(), file),
        overrideAccess: true,
      }),
    )
  }
  const [cover = await placeholderCover(), ...gallery] = uploaded
  await payload.create({
    collection: "museums",
    data: { ...museum, cover: cover.id, gallery: gallery.map((photo) => photo.id) },
    overrideAccess: true,
  })
  payload.logger.info(`Created ${museum.name}`)
}

payload.logger.info("Seed finished")
process.exit(0)
