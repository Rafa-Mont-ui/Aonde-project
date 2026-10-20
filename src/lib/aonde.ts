import "server-only"

import { getPayloadClient } from "@/lib/payload"
import type { AondeMuseum, PhotoCredit } from "@/types/aonde"
import type { Media } from "@/payload-types"

function mediaURL(value: unknown) {
  if (value && typeof value === "object" && "url" in value) {
    return String((value as { url?: string | null }).url || "")
  }
  return ""
}

function mediaCredit(value: unknown): PhotoCredit | null {
  if (!value || typeof value !== "object") return null
  const { credit, creditUrl } = value as Pick<Media, "credit" | "creditUrl">
  return credit ? { text: credit, url: creditUrl || null } : null
}

export async function getAondeMuseums(): Promise<AondeMuseum[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: "museums",
    depth: 1,
    limit: 50,
    sort: "createdAt",
    overrideAccess: false,
  })

  return docs.map((museum) => {
    const gallery = (Array.isArray(museum.gallery) ? museum.gallery : []).filter(
      (item) => mediaURL(item),
    )
    return {
      id: String(museum.id),
      name: museum.name,
      slug: museum.slug,
      type: museum.type,
      district: museum.district,
      description: museum.description,
      image: mediaURL(museum.cover),
      imageCredit: mediaCredit(museum.cover),
      gallery: gallery.map(mediaURL),
      galleryCredits: gallery.map(mediaCredit),
      openingHours: museum.openingHours,
      ticketInfo: museum.ticketInfo,
      exhibitionInfo: museum.exhibitionInfo,
      address: museum.address,
      website: museum.website,
      instagram: museum.instagram,
      // Ratings and visits change often, so the client loads them with
      // getMuseumStats() instead of baking them into the static pages.
      rating: null,
      reviewCount: 0,
      visits: 0,
      featured: Boolean(museum.featured),
      latitude: museum.latitude ?? null,
      longitude: museum.longitude ?? null,
      accessibility: museum.accessibilityFeatures ?? [],
    }
  })
}
