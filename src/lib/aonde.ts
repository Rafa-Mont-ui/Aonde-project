import "server-only"

import { getPayloadClient } from "@/lib/payload"
import type { AondeMuseum } from "@/types/aonde"

function mediaURL(value: unknown) {
  if (value && typeof value === "object" && "url" in value) {
    return String((value as { url?: string | null }).url || "")
  }
  return ""
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

  return docs.map((museum) => ({
    id: String(museum.id),
    name: museum.name,
    slug: museum.slug,
    type: museum.type,
    district: museum.district,
    description: museum.description,
    image: mediaURL(museum.cover),
    gallery: Array.isArray(museum.gallery)
      ? museum.gallery.map(mediaURL).filter(Boolean)
      : [],
    openingHours: museum.openingHours,
    ticketInfo: museum.ticketInfo,
    exhibitionInfo: museum.exhibitionInfo,
    address: museum.address,
    website: museum.website,
    instagram: museum.instagram,
    rating: null,
    reviewCount: 0,
    latitude: museum.latitude ?? null,
    longitude: museum.longitude ?? null,
    accessibility: museum.accessibilityFeatures ?? [],
  }))
}
