"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  AttributionControl,
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet"
import {
  Accessibility,
  ArrowRight,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Navigation,
} from "lucide-react"
import type { AondeMuseum } from "@/types/aonde"
import { Caption, CardTitle } from "./Typography"

type MapMuseum = AondeMuseum & { index: number }
type LatLng = [number, number]

const curitiba: LatLng = [-25.4284, -49.2733]
// Bottom navigation height that overlaps the bottom of the map area.
const navInset = 80
// Lucide "landmark", inlined because Leaflet markers take an HTML string.
const landmarkSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/></svg>'

function pinIcon(selected: boolean) {
  const size = selected ? 44 : 34
  return L.divIcon({
    className: "",
    html: `<span class="aonde-pin${selected ? " is-selected" : ""}">${landmarkSvg}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function distanceKm(a: LatLng, b: LatLng) {
  const rad = Math.PI / 180
  const dLat = (b[0] - a[0]) * rad
  const dLng = (b[1] - a[1]) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

function formatDistance(km: number) {
  return km < 1
    ? `${Math.round((km * 1000) / 10) * 10} m`
    : `${km.toFixed(1).replace(".", ",")} km`
}

function directionsUrl(museum: AondeMuseum) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${museum.name}, ${museum.address}`,
  )}`
}

function coordinates(museum: AondeMuseum): LatLng | null {
  return museum.latitude != null && museum.longitude != null
    ? [museum.latitude, museum.longitude]
    : null
}

function MapController({
  points,
  fitKey,
  focus,
  bottomInset,
}: {
  points: LatLng[]
  fitKey: string
  focus: { latlng: LatLng; key: number } | null
  bottomInset: number
}) {
  const map = useMap()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    // The screen slides in, so measure again once the container settles.
    const timer = window.setTimeout(() => map.invalidateSize(), 350)
    return () => window.clearTimeout(timer)
  }, [map])

  useEffect(() => {
    if (!points.length) {
      map.setView(curitiba, 12)
      return
    }
    map.fitBounds(L.latLngBounds(points), {
      paddingTopLeft: [48, 64],
      paddingBottomRight: [48, bottomInset + 32],
      maxZoom: 15,
    })
    // Refit only when the set of museums changes, not on every sheet drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map])

  useEffect(() => {
    if (!focus) return
    const zoom = Math.max(map.getZoom(), 15)
    // Aim above the sheet so the pin stays visible.
    const target = map.unproject(
      map.project(focus.latlng, zoom).add([0, bottomInset / 2]),
      zoom,
    )
    map.flyTo(target, zoom, { duration: reducedMotion ? 0 : 0.6 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.key, map])

  return null
}

export default function MapExplorer({
  museums,
  initialSelectedId,
  onOpen,
  onLocateError,
}: {
  museums: MapMuseum[]
  initialSelectedId?: string | null
  onOpen: (index: number) => void
  onLocateError: (message: string) => void
}) {
  const reducedMotion = useReducedMotion()
  const areaRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [areaHeight, setAreaHeight] = useState(0)
  const [snap, setSnap] = useState(initialSelectedId ? 1 : 0)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId ?? null,
  )
  const [user, setUser] = useState<LatLng | null>(null)
  const [locating, setLocating] = useState(false)
  const [focus, setFocus] = useState<{ latlng: LatLng; key: number } | null>(
    () => {
      const initial = museums.find((item) => item.id === initialSelectedId)
      const latlng = initial && coordinates(initial)
      return latlng ? { latlng, key: 0 } : null
    },
  )
  const height = useMotionValue(156)
  const drag = useRef<{
    startY: number
    startHeight: number
    lastY: number
    lastTime: number
    velocity: number
    moved: boolean
  } | null>(null)

  const snaps = useMemo(() => {
    const max = Math.max(220, areaHeight - navInset - 12)
    return [
      Math.min(156, max),
      Math.min(Math.round((areaHeight - navInset) * 0.55), max),
      max,
    ]
  }, [areaHeight])

  useEffect(() => {
    const element = areaRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) =>
      setAreaHeight(entry.contentRect.height),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    height.set(snaps[snap])
    // Keep the current snap point when the area is resized.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snaps])

  const snapTo = (index: number) => {
    setSnap(index)
    animate(
      height,
      snaps[index],
      reducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 420, damping: 42 },
    )
  }

  const sorted = useMemo(() => {
    const withDistance = museums.map((museum) => {
      const latlng = coordinates(museum)
      return {
        museum,
        latlng,
        distance: user && latlng ? distanceKm(user, latlng) : null,
      }
    })
    if (!user) return withDistance
    return [...withDistance].sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
    )
  }, [museums, user])

  const points = sorted.flatMap((item) => (item.latlng ? [item.latlng] : []))
  const fitKey = museums.map((item) => item.id).join(",")
  const selected = sorted.find((item) => item.museum.id === selectedId)

  const select = (id: string) => {
    setSelectedId(id)
    const latlng = coordinates(museums.find((item) => item.id === id)!)
    if (latlng) setFocus({ latlng, key: Date.now() })
    listRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" })
  }

  const locate = () => {
    if (!navigator.geolocation) {
      onLocateError("Seu navegador não permite obter a localização.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng: LatLng = [position.coords.latitude, position.coords.longitude]
        setUser(latlng)
        setFocus({ latlng, key: Date.now() })
        setLocating(false)
      },
      () => {
        setLocating(false)
        onLocateError(
          "Não foi possível obter sua localização. Verifique a permissão do navegador.",
        )
      },
      { timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div ref={areaRef} className="relative isolate h-full overflow-hidden">
      <MapContainer
        center={curitiba}
        zoom={12}
        zoomControl={false}
        attributionControl={false}
        className="aonde-map absolute inset-0 h-full w-full bg-secondary/30"
      >
        {/* Standard OSM tiles need no API key; styles.css tints them to the
            app palette (and inverts them in the dark theme). */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        <AttributionControl position="topleft" prefix={false} />
        <MapController
          points={points}
          fitKey={fitKey}
          focus={focus}
          bottomInset={snaps[0] + navInset}
        />
        {sorted.map(({ museum, latlng }) =>
          latlng ? (
            <Marker
              key={`${museum.id}-${museum.id === selectedId}`}
              position={latlng}
              icon={pinIcon(museum.id === selectedId)}
              title={museum.name}
              zIndexOffset={museum.id === selectedId ? 1000 : 0}
              eventHandlers={{
                click: () => {
                  select(museum.id)
                  // Half height fits the selected card and its actions.
                  if (snap !== 1) snapTo(1)
                },
              }}
            />
          ) : null,
        )}
        {user && (
          <CircleMarker
            center={user}
            radius={8}
            pathOptions={{
              color: "#fffdf7",
              weight: 3,
              fillColor: "#2f6fd6",
              fillOpacity: 1,
            }}
          />
        )}
      </MapContainer>

      <button
        onClick={locate}
        aria-label="Mostrar museus perto de mim"
        className="absolute right-3 top-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-field text-accent shadow-[0_8px_20px_#4c343026]"
      >
        {locating ? (
          <LoaderCircle size={19} className="animate-spin" />
        ) : (
          <LocateFixed size={19} />
        )}
      </button>

      <motion.section
        aria-label="Lista de museus no mapa"
        style={{ height, bottom: navInset }}
        className="absolute inset-x-0 z-[500] flex flex-col rounded-t-[1.75rem] border-t border-border bg-background shadow-[0_-12px_32px_#4c343024]"
      >
        <button
          aria-label={snap === 0 ? "Expandir lista" : "Recolher lista"}
          onClick={(event) => {
            // Pointer taps are handled below; this covers keyboard activation.
            if (event.detail === 0) snapTo(snap === 0 ? 1 : 0)
          }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = {
              startY: event.clientY,
              startHeight: height.get(),
              lastY: event.clientY,
              lastTime: event.timeStamp,
              velocity: 0,
              moved: false,
            }
          }}
          onPointerMove={(event) => {
            const state = drag.current
            if (!state) return
            const delta = event.clientY - state.startY
            if (Math.abs(delta) > 4) state.moved = true
            height.set(
              Math.min(snaps[2], Math.max(snaps[0] - 40, state.startHeight - delta)),
            )
            state.velocity =
              (event.clientY - state.lastY) /
              Math.max(1, event.timeStamp - state.lastTime)
            state.lastY = event.clientY
            state.lastTime = event.timeStamp
          }}
          onPointerUp={() => {
            const state = drag.current
            drag.current = null
            if (!state) return
            if (!state.moved) {
              snapTo(snap === 0 ? 1 : 0)
              return
            }
            const projected = height.get() - state.velocity * 180
            const nearest = snaps.reduce(
              (best, value, index) =>
                Math.abs(value - projected) < Math.abs(snaps[best] - projected)
                  ? index
                  : best,
              0,
            )
            snapTo(nearest)
          }}
          className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-2.5 active:cursor-grabbing"
        >
          <span className="h-1.5 w-10 rounded-full bg-foreground/20" />
        </button>
        <div className="flex shrink-0 items-baseline justify-between px-5 pb-2">
          <CardTitle>
            {museums.length} {museums.length === 1 ? "museu" : "museus"}
            {user ? " perto de você" : ""}
          </CardTitle>
          <Caption>{user ? "Por distância" : "Arraste para ver mais"}</Caption>
        </div>
        <div
          ref={listRef}
          className="hide-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4"
        >
          {selected && (
            <article className="mb-2 rounded-2xl border border-primary/30 bg-field p-3 shadow-[0_8px_20px_#4c34301a]">
              <div className="flex gap-3">
                <img
                  src={selected.museum.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <CardTitle className="line-clamp-2">{selected.museum.name}</CardTitle>
                  <Caption className="mt-1 block">
                    {selected.museum.type} · {selected.museum.district}
                    {selected.distance != null &&
                      ` · ${formatDistance(selected.distance)}`}
                  </Caption>
                  {selected.museum.accessibility.length > 0 && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[.6em] font-semibold text-accent">
                      <Accessibility size={12} />
                      Recursos de acessibilidade
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpen(selected.museum.index)}
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-primary text-[.7em] font-semibold text-background"
                >
                  Ver detalhes
                  <ArrowRight size={14} />
                </button>
                <a
                  href={directionsUrl(selected.museum)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-[.7em] font-semibold"
                >
                  <Navigation size={14} className="text-accent" />
                  Como chegar
                </a>
              </div>
            </article>
          )}
          {sorted
            .filter((item) => item.museum.id !== selectedId)
            .map(({ museum, latlng, distance }) => (
              <button
                key={museum.id}
                onClick={() => (latlng ? select(museum.id) : onOpen(museum.index))}
                className="flex min-h-16 w-full items-center gap-3 border-b border-border py-2 text-left last:border-b-0"
              >
                <img
                  src={museum.image}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-xl object-cover"
                />
                <span className="min-w-0 flex-1">
                  <CardTitle className="truncate">{museum.name}</CardTitle>
                  <Caption className="mt-0.5 block">
                    {latlng
                      ? `${museum.type} · ${museum.district}${
                          distance != null ? ` · ${formatDistance(distance)}` : ""
                        }`
                      : "Localização não cadastrada"}
                  </Caption>
                </span>
                {museum.accessibility.length > 0 && (
                  <Accessibility
                    size={15}
                    className="shrink-0 text-accent"
                    aria-label="Possui recursos de acessibilidade"
                  />
                )}
                {latlng ? (
                  <MapPin size={15} className="shrink-0 text-foreground/40" />
                ) : (
                  <ArrowRight size={15} className="shrink-0 text-accent" />
                )}
              </button>
            ))}
          {!museums.length && (
            <p className="py-6 text-center text-[.75em] text-foreground/60">
              Nenhum museu com esses filtros.
            </p>
          )}
        </div>
      </motion.section>
    </div>
  )
}
