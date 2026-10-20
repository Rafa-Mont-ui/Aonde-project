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
  /** Number of visits logged in the app (from getMuseumStats). */
  visits: number
  /** Picked by the team in the admin ("Recomendado pelo Aondê"). */
  featured: boolean
  latitude: number | null
  longitude: number | null
  /** Values from `accessibilityOptions` in src/lib/accessibility.ts. */
  accessibility: string[]
}
