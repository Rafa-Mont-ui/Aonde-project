/** Attribution shown under a photo (required by licenses like CC BY-SA). */
export type PhotoCredit = { text: string; url: string | null }

export type AondeMuseum = {
  id: string
  name: string
  slug: string
  type: string
  district: string
  description: string
  image: string
  imageCredit: PhotoCredit | null
  gallery: string[]
  /** Credits for `gallery`, in the same order. */
  galleryCredits: (PhotoCredit | null)[]
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
