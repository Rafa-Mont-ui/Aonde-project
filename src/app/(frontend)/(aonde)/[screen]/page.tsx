const screens = [
  "welcome",
  "signup",
  "accessibility",
  "login",
  "verify",
  "reset",
  "home",
  "map",
  "results",
  "search",
  "details",
  "reviews",
  "rate",
  "profile",
  "saved",
]

export const dynamicParams = false

export function generateStaticParams() {
  return screens.map((screen) => ({ screen }))
}

// Each screen is rendered by the shared (aonde) layout; this route only
// defines which screen URLs exist.
export default function ScreenPage() {
  return null
}
