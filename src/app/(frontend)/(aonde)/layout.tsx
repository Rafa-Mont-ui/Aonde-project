import AondeClient from "@/components/aonde/AondeClient"
import { getAondeMuseums } from "@/lib/aonde"

// Every screen is its own URL, but the app lives in this shared layout so
// Next.js keeps it mounted (and its state) while navigating between screens.
export default async function AondeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const museums = await getAondeMuseums()
  return (
    <>
      <AondeClient museums={museums} />
      {children}
    </>
  )
}
