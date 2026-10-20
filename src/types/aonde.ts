export type AondeMuseum = {
  id: string
  name: string
  slug: string
  type: string
  district: string
  description: string
  image: string
  gallery: string[]
  openingHours: string
  ticketInfo: string
  exhibitionInfo?: string | null
  address: string
  website?: string | null
  instagram?: string | null
  rating: number | null
  reviewCount: number
  latitude: number | null
  longitude: number | null
  /** Values from `accessibilityOptions` in src/lib/accessibility.ts. */
  accessibility: string[]
}
