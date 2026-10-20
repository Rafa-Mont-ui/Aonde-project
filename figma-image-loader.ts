'use client'

// Local replacement for the Figma Cloud loader: Payload serves uploads from
// /api/media/file/..., so images are passed through unchanged.
export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
  return src
}
