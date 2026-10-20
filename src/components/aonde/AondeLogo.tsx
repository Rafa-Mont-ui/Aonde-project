import { useId } from "react"
import logoArtwork from "./brandLogoVariantsMarkup"

const paths = Array.from(
  logoArtwork.matchAll(/<path d="([^"]+)" fill="([^"]+)"/g),
  (match) => ({ path: match[1], counter: match[2] === "white" }),
)
const variants = {
  horizontal: {
    viewBox: "625 105 631 179",
    bounds: { x: 625, y: 105, width: 631, height: 179 },
    parts: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 18, 21, 22, 25],
    label: "Logo Aondê?",
  },
  compact: {
    viewBox: "1488 65 466 258",
    bounds: { x: 1488, y: 65, width: 466, height: 258 },
    parts: [0, 1, 2, 3, 4, 15, 16, 17, 19, 20, 23, 24],
    label: "Logo Aondê",
  },
}

export default function AondeLogo({
  variant = "horizontal",
  className = "",
}: {
  variant?: keyof typeof variants
  className?: string
}) {
  const maskId = `aonde-logo-${useId().replace(/:/g, "")}`
  const artwork = variants[variant]

  return (
    <svg
      viewBox={artwork.viewBox}
      role="img"
      aria-label={artwork.label}
      className={`block shrink-0 text-foreground ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" {...artwork.bounds}>
          {artwork.parts.map((index) => (
            <path
              key={index}
              d={paths[index].path}
              fill={paths[index].counter ? "black" : "white"}
            />
          ))}
        </mask>
      </defs>
      <rect {...artwork.bounds} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  )
}
