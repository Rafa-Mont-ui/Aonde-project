"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import type { AondeMuseum } from "@/types/aonde"

const AondeApp = dynamic(() => import("./AondeApp"), { ssr: false })

export default function AondeClient({
  museums,
}: {
  museums: AondeMuseum[]
}) {
  if (!museums.length) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-6 text-center text-foreground">
        <div className="glass max-w-sm rounded-[1.75rem] p-6">
          <p className="text-[.62em] font-bold uppercase tracking-[.14em] text-accent">
            Aondê
          </p>
          <p className="mt-2 text-[1.45em] font-bold leading-tight">
            Novos lugares estão chegando
          </p>
          <p className="mt-3 text-[.8em] leading-relaxed text-foreground/70">
            O catálogo de museus está sendo preparado. Volte em breve para
            explorar Curitiba.
          </p>
        </div>
      </main>
    )
  }
  // AondeApp reads the selected museum from the URL (useSearchParams).
  return (
    <Suspense>
      <AondeApp initialMuseums={museums} />
    </Suspense>
  )
}
