"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  AttributionControl,
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
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
// Lucide "landmark", inlined because Leaflet markers take an HTML string.
const landmarkSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/></svg>'

function pinIcon(selected: boolean, zoom: number) {
  // Smaller pins when zoomed out keep the dense city center readable.
  const size = selected ? 44 : zoom >= 15 ? 34 : zoom >= 13 ? 26 : 16
  // The tappable area stays at least 28px even when the dot is smaller.
  const hit = Math.max(size, 28)
  const classes = `aonde-pin${selected ? " is-selected" : ""}${size < 20 ? " is-dot" : ""}`
  return L.divIcon({
    className: "",
    html: `<span class="${classes}" style="width:${size}px;height:${size}px;margin:${(hit - size) / 2}px">${landmarkSvg}</span>`,
    iconSize: [hit, hit],
    iconAnchor: [hit / 2, hit / 2],
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

// Some museums share a building (MAC-PR inside the MON, the Gravura and
// Fotografia museums in the Memorial de Curitiba). Fan their pins out around
// the shared point so each one can be tapped once the map is zoomed in.
function pinPositions(museums: AondeMuseum[]) {
  const groups: { center: LatLng; members: AondeMuseum[] }[] = []
  for (const museum of museums) {
    const latlng = coordinates(museum)
    if (!latlng) continue
    const group = groups.find(({ center }) => distanceKm(center, latlng) < 0.02)
    if (group) group.members.push(museum)
    else groups.push({ center: latlng, members: [museum] })
  }
  const positions = new Map<string, LatLng>()
  for (const { center, members } of groups) {
    members.forEach((museum, i) => {
      if (members.length === 1) {
        positions.set(museum.id, center)
        return
      }
      // About 18 m from the shared point.
      const angle = (2 * Math.PI * i) / members.length
      positions.set(museum.id, [
        center[0] + 0.00016 * Math.cos(angle),
        center[1] + 0.00018 * Math.sin(angle),
      ])
    })
  }
  return positions
}

function MapController({
  points,
  fitKey,
  focus,
}: {
  points: LatLng[]
  fitKey: string
  focus: { latlng: LatLng; key: number } | null
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
    // Room for the locate button (top) and the attribution (bottom).
    map.fitBounds(L.latLngBounds(points), {
      paddingTopLeft: [40, 56],
      paddingBottomRight: [40, 40],
      maxZoom: 15,
    })
    // Refit only when the set of museums changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map])

  useEffect(() => {
    if (!focus) return
    map.flyTo(focus.latlng, Math.max(map.getZoom(), 15), {
      duration: reducedMotion ? 0 : 0.6,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.key, map])

  return null
}

function ZoomWatcher({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMapEvents({ zoomend: () => onZoom(map.getZoom()) })
  return null
}

export default function MapExplorer({
  museums,
  initialSelectedId,
  onOpen,
  onLocateError,
  onReveal,
}: {
  museums: MapMuseum[]
  initialSelectedId?: string | null
  onOpen: (index: number) => void
  onLocateError: (message: string) => void
  /** Scrolls the screen so `element` is visible. */
  onReveal: (element: HTMLElement) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId ?? null,
  )
  const [user, setUser] = useState<LatLng | null>(null)
  const [locating, setLocating] = useState(false)
  const [zoom, setZoom] = useState(12)
  const positions = useMemo(() => pinPositions(museums), [museums])
  const [focus, setFocus] = useState<{ latlng: LatLng; key: number } | null>(
    () => {
      const latlng = initialSelectedId && positions.get(initialSelectedId)
      return latlng ? { latlng, key: 0 } : null
    },
  )

  const sorted = useMemo(() => {
    const withDistance = museums.map((museum) => {
      const real = coordinates(museum)
      return {
        museum,
        latlng: positions.get(museum.id) ?? null,
        distance: user && real ? distanceKm(user, real) : null,
      }
    })
    if (!user) return withDistance
    return [...withDistance].sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
    )
  }, [museums, positions, user])

  const points = sorted.flatMap((item) => (item.latlng ? [item.latlng] : []))
  const fitKey = museums.map((item) => item.id).join(",")
  const selected = sorted.find((item) => item.museum.id === selectedId)

  const select = (id: string) => {
    setSelectedId(id)
    const latlng = positions.get(id)
    if (latlng) setFocus({ latlng, key: Date.now() })
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
    <>
      <div
        ref={mapRef}
        className="relative isolate mx-5 h-[clamp(14rem,42dvh,22rem)] scroll-mt-4 overflow-hidden rounded-[1.75rem] border border-border shadow-[0_10px_28px_#4c34301f]"
      >
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
          <AttributionControl position="bottomleft" prefix={false} />
          <MapController points={points} fitKey={fitKey} focus={focus} />
          <ZoomWatcher onZoom={setZoom} />
          {sorted.map(({ museum, latlng }) =>
            latlng ? (
              <Marker
                key={`${museum.id}-${museum.id === selectedId}`}
                position={latlng}
                icon={pinIcon(museum.id === selectedId, zoom)}
                title={museum.name}
                zIndexOffset={museum.id === selectedId ? 1000 : 0}
                eventHandlers={{
                  click: () => {
                    select(museum.id)
                    // The card renders below the map; bring it into view.
                    requestAnimationFrame(() => {
                      if (cardRef.current) onReveal(cardRef.current)
                    })
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
      </div>

      <section aria-label="Lista de museus no mapa" className="mt-6 px-5">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <CardTitle>
            {museums.length} {museums.length === 1 ? "museu" : "museus"}
            {user ? " perto de você" : ""}
          </CardTitle>
          <Caption>{user ? "Por distância" : "Toque para ver no mapa"}</Caption>
        </div>
        {selected && (
          <article
            ref={cardRef}
            className="mb-3 rounded-2xl border border-primary/30 bg-field p-3 shadow-[0_8px_20px_#4c34301a]"
          >
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
        {sorted.some((item) => item.museum.id !== selectedId) && (
          <div className="rounded-[1.5rem] border border-border bg-field px-3">
            {sorted
              .filter((item) => item.museum.id !== selectedId)
              .map(({ museum, latlng, distance }) => (
                <button
                  key={museum.id}
                  onClick={() => {
                    if (!latlng) return onOpen(museum.index)
                    select(museum.id)
                    // Scroll back up so the map shows the pin.
                    if (mapRef.current) onReveal(mapRef.current)
                  }}
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
          </div>
        )}
        {!museums.length && (
          <p className="py-6 text-center text-[.75em] text-foreground/60">
            Nenhum museu com esses filtros.
          </p>
        )}
      </section>
    </>
  )
}
