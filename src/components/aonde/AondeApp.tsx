"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { AondeMuseum } from "@/types/aonde"
import {
  getMuseumStats,
  getSession,
  login,
  logout,
  signup as createAccount,
  submitReview,
  toggleFavorite,
  updateNickname,
  type AondeSession,
  type MuseumStats,
  type SessionUser,
} from "@/lib/aonde-actions"
import {
  ArrowRight,
  ArrowLeft,
  ImagePlus,
  Search,
  Home,
  UserRound,
  Menu,
  X,
  Star,
  Bookmark,
  SlidersHorizontal,
  Accessibility,
  CircleHelp,
  MapPin,
  Landmark,
  Palette,
  CalendarDays,
  Ticket,
  Sparkles,
  Globe2,
  AtSign,
  Check,
  LockKeyhole,
  LogIn,
  LogOut,
  Navigation,
  Share2,
  ArrowUpDown,
  Toilet,
  CircleParking,
  Hand,
  AudioLines,
  Footprints,
  UsersRound,
  TrendingUp,
  Fingerprint,
  Armchair,
  type LucideIcon,
} from "lucide-react"
import { accessibilityLabel } from "@/lib/accessibility"
import AondeLogo from "./AondeLogo"
import MapExplorer from "./MapExplorer"
import WelcomeIntro from "./WelcomeIntro"
import {
  BodyText,
  Caption,
  CardTitle,
  DisplayTitle,
  Eyebrow,
  PageTitle,
  SectionTitle,
} from "./Typography"

const criteria = ["Acervo", "Acessibilidade", "Estrutura", "Atendimento"]
const districts = [
  "Matriz",
  "Boa Vista",
  "Santa Felicidade",
  "Cajuru",
  "Portão",
  "CIC",
  "Boqueirão",
  "Pinheirinho",
  "Bairro Novo",
  "Tatuquara",
]
const accessibilityIcons: Record<string, LucideIcon> = {
  rampa: Accessibility,
  elevador: ArrowUpDown,
  banheiro: Toilet,
  "vaga-pcd": CircleParking,
  libras: Hand,
  audiodescricao: AudioLines,
  "piso-tatil": Footprints,
  "recursos-tateis": Fingerprint,
  "cadeira-de-rodas": Armchair,
}
const types = ["Tipos", "Arte", "História", "Ciência", "Memória", "Outros"]
type Screen = "welcome" | "signup" | "accessibility" | "login" | "verify" | "reset" | "home" | "map" | "results" | "search" | "details" | "reviews" | "rate" | "profile" | "saved"
type NoticeTone = "success" | "error" | "info" | "warning"
type HomeTab = "app" | "community" | "visited"
const homeTabs: { id: HomeTab; label: string; hint: string }[] = [
  {
    id: "app",
    label: "Recomendação do app",
    hint: "Seleção da equipe Aondê",
  },
  {
    id: "community",
    label: "Recomendação dos usuários",
    hint: "Os mais bem avaliados por quem visitou",
  },
  {
    id: "visited",
    label: "Mais visitados",
    hint: "Com mais visitas registradas no Aondê",
  },
]

const emptyRatings = [0, 0, 0, 0]
const emptySession: AondeSession = {
  user: null,
  favorites: [],
  visits: [],
  reviews: {},
}
// Screens about a single museum carry it in the URL (?museu=<slug>), so
// reloading or sharing the link opens the same museum.
const museumScreens: Screen[] = ["details", "reviews", "rate"]

function avatarKey(userId: string) {
  return `museia-avatar-${userId}`
}

function MuseumPhoto({
  src,
  alt,
  className = "",
}: {
  src: string
  alt: string
  className?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const reducedMotion = useReducedMotion()
  const imageRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth)
      setLoaded(true)
  }, [src])
  return (
    <div className={`relative overflow-hidden bg-secondary/40 ${className}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary/30 via-surface to-accent/10 motion-reduce:animate-none"
        />
      )}
      <motion.img
        ref={imageRef}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        initial={false}
        animate={{
          opacity: loaded ? 1 : 0,
          scale: loaded || reducedMotion ? 1 : 1.025,
        }}
        transition={{ duration: reducedMotion ? 0 : 0.4 }}
        className="h-full w-full object-cover object-[center_70%]"
      />
      {failed && (
        <span
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex items-center justify-center text-accent"
        >
          <Landmark size={32} strokeWidth={1.2} />
        </span>
      )}
    </div>
  )
}

function MuseumSlide({
  src,
  slideId,
  alt,
  direction,
  onStep,
  onOpen,
  overlay,
}: {
  src: string
  slideId: string
  alt: string
  direction: number
  onStep: (step: number) => void
  onOpen?: () => void
  overlay: ReactNode
}) {
  const reducedMotion = useReducedMotion()
  const dragging = useRef(false)
  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Fotos dos museus. Deslize para os lados para navegar."
      className="relative min-w-0 flex-1 overflow-hidden rounded-[2rem] [perspective:1000px]"
    >
      <div className="relative aspect-[1.22] w-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.button
            key={slideId}
            type="button"
            custom={direction}
            variants={{
              enter: (step: number) => ({
                x: reducedMotion ? 0 : step * 290,
                opacity: reducedMotion ? 0 : 0.5,
                scale: reducedMotion ? 1 : 0.92,
                rotateY: reducedMotion ? 0 : step * -8,
              }),
              center: { x: 0, opacity: 1, scale: 1, rotateY: 0 },
              exit: (step: number) => ({
                x: reducedMotion ? 0 : step * -290,
                opacity: 0,
                scale: reducedMotion ? 1 : 0.94,
                rotateY: reducedMotion ? 0 : step * 8,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: reducedMotion ? 0.15 : 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.28}
            dragMomentum={false}
            onDragStart={() => {
              dragging.current = true
            }}
            onDragEnd={(_, info) => {
              if (
                Math.abs(info.offset.x) > 38 ||
                Math.abs(info.velocity.x) > 450
              ) {
                onStep(info.offset.x < 0 ? 1 : -1)
              }
              window.setTimeout(() => {
                dragging.current = false
              }, 120)
            }}
            onClick={() => {
              if (!dragging.current) onOpen?.()
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault()
                onStep(event.key === "ArrowRight" ? 1 : -1)
              }
            }}
            aria-label={
              onOpen ? `Ver ${alt}` : `${alt}. Use as setas para trocar a foto.`
            }
            className="absolute inset-0 w-full touch-pan-y cursor-grab overflow-hidden rounded-[2rem] text-left shadow-[0_20px_44px_var(--surface-shadow)] active:cursor-grabbing focus-visible:-outline-offset-4"
          >
            <MuseumPhoto
              src={src}
              alt={alt}
              className="absolute inset-0 h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/5 to-black/80" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              {overlay}
            </div>
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  )
}
function Logo() {
  return (
    <div className="flex h-16 w-28 items-center justify-center">
      <AondeLogo className="h-full w-full" />
    </div>
  )
}
function IconButton({
  children,
  label,
  onClick,
  className = "",
  current,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  className?: string
  current?: "page"
}) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-current={current}
      onClick={onClick}
      whileTap={reducedMotion ? undefined : { scale: 0.9 }}
      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
      transition={{ type: "spring", stiffness: 450, damping: 26 }}
      className={`flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-accent/10 ${className}`}
    >
      {children}
    </motion.button>
  )
}
function ArrowButton({
  onClick,
  label = "Continuar",
  disabled = false,
}: {
  onClick?: () => void
  label?: string
  disabled?: boolean
}) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.button
      aria-busy={disabled}
      disabled={disabled}
      onClick={onClick}
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[.82em] font-semibold text-background shadow-[0_12px_28px_#3c654333] disabled:opacity-60"
    >
      {label}
      <ArrowRight
        size={18}
        strokeWidth={2}
        className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </motion.button>
  )
}
function FormIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-8">
      <Eyebrow>{eyebrow}</Eyebrow>
      <PageTitle className="mt-2 text-[1.6em]">{title}</PageTitle>
      {children && <BodyText className="mt-2.5">{children}</BodyText>}
    </div>
  )
}
function Field({
  label,
  name,
  type = "text",
  autoComplete,
  minLength,
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
}: {
  label: string
  name?: string
  type?: string
  autoComplete?: string
  minLength?: number
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[.72em] font-semibold">{label}</span>
      <input
        aria-label={label}
        name={name}
        required={required}
        disabled={disabled}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        onBlur={onBlur}
        className="h-12 w-full rounded-2xl border border-border bg-field px-4 text-[.85em] outline-none transition-[border-color,box-shadow] placeholder:text-foreground/35 focus:border-primary/60 focus:shadow-[0_0_0_4px_#3c65431a]"
      />
    </label>
  )
}

function Prototype({ initialMuseums }: { initialMuseums: AondeMuseum[] }) {
  const [stats, setStats] = useState<MuseumStats>({})
  // Static museum data plus live ratings and visits loaded after mount.
  const museums = useMemo(
    () => initialMuseums.map((item) => ({ ...item, ...stats[item.id] })),
    [initialMuseums, stats],
  )
  const [homeTab, setHomeTab] = useState<HomeTab>("app")
  // Museum indexes shown in the home carousel for each tab.
  const listFor = useCallback(
    (tab: HomeTab) => {
      const all = museums.map((item, index) => ({ item, index }))
      if (tab === "community")
        return all
          .filter(({ item }) => item.rating !== null)
          .sort(
            (a, b) =>
              (b.item.rating ?? 0) - (a.item.rating ?? 0) ||
              b.item.reviewCount - a.item.reviewCount,
          )
          .map(({ index }) => index)
      if (tab === "visited")
        return all
          .filter(({ item }) => item.visits > 0)
          .sort((a, b) => b.item.visits - a.item.visits)
          .map(({ index }) => index)
      // Until the team marks museums as recommended, show the whole catalog.
      const featured = all.filter(({ item }) => item.featured)
      return (featured.length ? featured : all).map(({ index }) => index)
    },
    [museums],
  )
  const homeList = useMemo(() => listFor(homeTab), [listFor, homeTab])
  const router = useRouter()
  const pathname = usePathname()
  const screen = (pathname.slice(1) || "welcome") as Screen
  const museumSlug = useSearchParams().get("museu")
  const museumIndexFor = (slug: string | null) =>
    slug ? museums.findIndex((item) => item.slug === slug) : -1
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const scrollPositions = useRef<Record<string, number>>({})
  const [dark, setDark] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("museia-theme") === "dark",
  )
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? 16
      : Number(localStorage.getItem("museia-size") || 16),
  )
  const [alt, setAlt] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("museia-alt") === "true",
  )
  const [menu, setMenu] = useState(false)
  // Pinterest-style: the top header slides away while scrolling down.
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollTop = useRef(0)
  const headerLockedUntil = useRef(0)
  const homeTabsRef = useRef<HTMLDivElement>(null)
  const [homeTabsStuck, setHomeTabsStuck] = useState(false)
  const [filterSheet, setFilterSheet] = useState(false)
  const [notice, setNotice] = useState<{
    text: string
    tone: NoticeTone
  } | null>(null)
  const [museum, setMuseum] = useState(() =>
    Math.max(0, museumIndexFor(museumSlug)),
  )
  const [photo, setPhoto] = useState(0)
  const [slideDirection, setSlideDirection] = useState(1)
  const reducedMotion = useReducedMotion()
  const [introVisible, setIntroVisible] = useState(screen === "welcome")
  const skipTapBlocked = useRef(false)
  const finishIntro = useCallback(() => setIntroVisible(false), [])
  const [signup, setSignup] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const authenticated = user !== null
  const [pending, startTransition] = useTransition()
  const [nickname, setNickname] = useState("")
  const [avatar, setAvatar] = useState("")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("Tipos")
  const [district, setDistrict] = useState("")
  const [accessibleOnly, setAccessibleOnly] = useState(false)
  // Museum to highlight when the map opens from a museum's page.
  const [mapFocus, setMapFocus] = useState<string | null>(null)
  // Draft scores for the "rate" screen; saved reviews live in `myReviews`.
  const [ratings, setRatings] = useState<number[]>(emptyRatings)
  const [uploads, setUploads] = useState<string[]>([])
  // Museum IDs (not list positions), so they survive catalog changes.
  const [saved, setSaved] = useState<string[]>([])
  const [visited, setVisited] = useState<string[]>([])
  const [myReviews, setMyReviews] = useState<Record<string, number[]>>({})
  const [profileTab, setProfileTab] = useState("Visitados")
  const [code, setCode] = useState(["", "", "", ""])
  const current = museums[museum]
  // The details carousel only shows this museum's own cover and gallery.
  const photos = [current.image, ...current.gallery].filter(Boolean)
  const photoCredits = [current.imageCredit, ...current.galleryCredits]
  const myRatings = current ? myReviews[current.id] : undefined
  const hasRated = Boolean(myRatings)
  const indexesOf = (ids: string[]) =>
    museums.flatMap((item, index) => (ids.includes(item.id) ? [index] : []))
  const savedIndexes = indexesOf(saved)
  const visitedIndexes = indexesOf(visited)
  const isSaved = (index: number) => saved.includes(museums[index]?.id ?? "")
  const applySession = useCallback((session: AondeSession) => {
    setUser(session.user)
    setNickname(session.user?.nickname ?? "")
    setSaved(session.favorites)
    setVisited(session.visits)
    setMyReviews(session.reviews)
    setUploads([])
    let storedAvatar = ""
    try {
      if (session.user)
        storedAvatar = localStorage.getItem(avatarKey(session.user.id)) || ""
    } catch {}
    setAvatar(storedAvatar)
  }, [])
  const go = (next: Screen, museumIndex = museum) => {
    const target = museums[museumIndex]
    const href =
      museumScreens.includes(next) && target
        ? `/${next}?museu=${encodeURIComponent(target.slug)}`
        : `/${next}`
    if (next === screen && museumIndex === museum) {
      scrollRef.current?.scrollTo({
        top: 0,
        behavior: reducedMotion ? "instant" : "smooth",
      })
      setMenu(false)
      return
    }
    if (next === "search") setDistrict("")
    setMenu(false)
    router.push(href)
  }
  const back = () =>
    window.history.length > 1 ? router.back() : router.push("/welcome")
  const signOut = () =>
    startTransition(async () => {
      await logout()
      applySession(emptySession)
    })
  const requireAccount = (message: string) => {
    if (authenticated) return true
    if (sessionReady) {
      notify(message, "warning")
      startSignup()
    }
    return false
  }
  const startSignup = () => {
    finishIntro()
    setSignup(true)
    go("signup")
  }
  const choosePhoto = () => {
    if (!authenticated) {
      notify(
        "Cadastre-se para adicionar fotos ao seu perfil e às avaliações.",
        "warning",
      )
      startSignup()
      return
    }
    fileRef.current?.click()
  }
  const externalUrl = (value?: string | null) =>
    !value ? null : /^https?:\/\//.test(value) ? value : `https://${value}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${current.name}, ${current.address}`,
  )}`
  const websiteUrl = externalUrl(current.website)
  const instagramUrl = current.instagram
    ? `https://instagram.com/${current.instagram.replace(/^@/, "")}`
    : null
  const shareMuseum = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: current.name,
          text: `Conheça o ${current.name} no Aondê`,
          url,
        })
        return
      }
      await navigator.clipboard.writeText(url)
      notify("Link do museu copiado.", "success")
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        notify("Não foi possível compartilhar agora.", "error")
    }
  }
  const startRating = () => {
    if (!requireAccount("Cadastre-se ou entre para avaliar museus.")) return
    setRatings(myRatings ?? emptyRatings)
    setUploads([])
    go("rate")
  }
  const openMuseum = (index: number) => {
    setMuseum(index)
    setPhoto(0)
    go("details", index)
  }
  const selectHomeTab = (tab: HomeTab) => {
    const list = listFor(tab)
    setHomeTab(tab)
    if (list.length) {
      setSlideDirection(1)
      setMuseum(list[0])
    }
  }
  const stepSlide = (step: number, details: boolean) => {
    setSlideDirection(step)
    if (details)
      setPhoto((previous) => (previous + step + photos.length) % photos.length)
    else {
      const position = Math.max(0, homeList.indexOf(museum))
      setMuseum(homeList[(position + step + homeList.length) % homeList.length])
    }
  }
  const toggleSaved = (index: number) => {
    const target = museums[index]
    if (!target || pending) return
    if (!requireAccount("Cadastre-se ou entre para salvar museus na sua lista."))
      return
    startTransition(async () => {
      const result = await toggleFavorite(target.id)
      if (!result.ok) return notify(result.error, "error")
      setSaved((previous) => {
        const others = previous.filter((id) => id !== target.id)
        return result.saved ? [...others, target.id] : others
      })
      notify(
        result.saved
          ? "Museu adicionado à sua lista."
          : "Museu removido da sua lista.",
        "success",
      )
    })
  }
  const notify = (text: string, tone: NoticeTone = "info") => {
    setNotice({ text, tone })
  }
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
    if (screen !== "map") setMapFocus(null)
    setHeaderHidden(false)
    lastScrollTop.current = 0
  }, [screen])
  useEffect(() => {
    if (!menu) return
    const previousFocus = document.activeElement as HTMLElement | null
    const timer = window.setTimeout(
      () =>
        menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus(),
      50,
    )
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false)
      if (event.key === "Tab") {
        const buttons =
          menuRef.current?.querySelectorAll<HTMLButtonElement>("button")
        if (!buttons?.length) return
        const first = buttons[0],
          last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("keydown", handleKey)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [menu])
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [notice])
  useEffect(() => {
    localStorage.setItem("museia-theme", dark ? "dark" : "light")
    localStorage.setItem("museia-size", String(size))
    localStorage.setItem("museia-alt", String(alt))
  }, [dark, size, alt])
  useEffect(() => {
    // Follow the URL (back/forward, shared links) to the museum it names.
    const index = museumSlug
      ? museums.findIndex((item) => item.slug === museumSlug)
      : -1
    if (index >= 0) setMuseum(index)
  }, [museumSlug, museums])
  useEffect(() => {
    setPhoto(0)
  }, [museum])
  useEffect(() => {
    getMuseumStats()
      .then(setStats)
      .catch(() => undefined)
  }, [])
  useEffect(() => {
    // Keep the home carousel on a museum that belongs to the selected tab.
    if (screen === "home" && homeList.length && !homeList.includes(museum))
      setMuseum(homeList[0])
  }, [screen, homeList, museum])
  useEffect(() => {
    let active = true
    getSession()
      .then((session) => {
        if (active) applySession(session)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setSessionReady(true)
      })
    return () => {
      active = false
    }
  }, [applySession])
  useEffect(() => {
    if (!filterSheet) return
    const previousFocus = document.activeElement as HTMLElement | null
    const timer = window.setTimeout(
      () =>
        filterRef.current
          ?.querySelector<HTMLButtonElement>("button")
          ?.focus(),
      50,
    )
    const handleFilterKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterSheet(false)
      if (event.key === "Tab") {
        const controls =
          filterRef.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled), input:not(:disabled)",
          )
        if (!controls?.length) return
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener("keydown", handleFilterKeys)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("keydown", handleFilterKeys)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [filterSheet])
  const visible = museums
    .map((item, index) => ({ ...item, index }))
    .filter(
      (item) =>
        (filter === "Tipos" || item.type === filter) &&
        (!district || item.district === district) &&
        (!accessibleOnly || item.accessibility.length > 0) &&
        (!query ||
          item.name
            .toLocaleLowerCase("pt-BR")
            .includes(query.toLocaleLowerCase("pt-BR"))),
    )
  const activeFilters =
    Number(filter !== "Tipos") + Number(Boolean(district)) + Number(accessibleOnly)
  const clearFilters = () => {
    setFilter("Tipos")
    setDistrict("")
    setAccessibleOnly(false)
  }
  const photoAlt = (name: string) =>
    alt
      ? `Fotografia do ${name}: arquitetura e espaços culturais de Curitiba.`
      : name
  const formatRating = (rating: number | null) =>
    rating === null ? "Sem avaliações" : rating.toFixed(1).replace(".", ",")
  const ratingText = formatRating(current.rating)
  const openNow = (() => {
    const now = new Date()
    return now.getDay() !== 1 && now.getHours() >= 10 && now.getHours() < 18
  })()
  const exploredDistricts = new Set(
    visitedIndexes.map((index) => museums[index].district),
  ).size
  const detailItems = [
    {
      label: "Funcionamento",
      text: current.openingHours,
      icon: CalendarDays,
    },
    {
      label: "Entrada",
      text: current.ticketInfo,
      icon: Ticket,
    },
    {
      label: "Exposição",
      text: current.exhibitionInfo || "Consulte a programação atual",
      icon: Sparkles,
    },
    {
      label: "Contatos",
      text: "Informações no\nsite oficial",
      icon: Globe2,
    },
    {
      label: "Redes Sociais",
      text: "Instagram\nSite oficial",
      icon: AtSign,
    },
    {
      label: "Tipo",
      text: current.type,
      icon: Landmark,
    },
  ]
  const Header = () => (
    <header className="relative z-20 flex h-[104px] shrink-0 items-start justify-between rounded-b-[50%_24px] border-b border-border bg-secondary/55 px-5 pt-3 shadow-[0_8px_24px_var(--surface-shadow)] backdrop-blur-xl">
      <IconButton
        label="Ajuda"
        onClick={() =>
          notify(
            "Explore os museus, descubra a cidade e compartilhe sua avaliação.",
          )
        }
      >
        <CircleHelp size={22} strokeWidth={1.4} />
      </IconButton>
      <button aria-label="Página inicial" onClick={() => go("home")}>
        <Logo />
      </button>
      <IconButton label="Abrir menu" onClick={() => setMenu(!menu)}>
        <Menu size={24} strokeWidth={1.4} />
      </IconButton>
    </header>
  )
  const Bottom = ({ active }: { active: "home" | "search" | "profile" }) => {
    const order = ["home", "search", "profile"] as const
    return (
      <nav
        aria-label="Navegação principal"
        className="absolute inset-x-0 bottom-0 z-30 flex h-[calc(91px_+_env(safe-area-inset-bottom))] items-start justify-around rounded-t-[50%_24px] border-t border-border bg-secondary/95 px-8 pt-4 backdrop-blur-xl"
      >
        {order.map((tab) => {
          const Icon =
            tab === "home" ? Home : tab === "search" ? Search : UserRound
          return (
            <motion.div
              layout={!reducedMotion}
              key={tab}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 30 }
              }
            >
              <IconButton
                key={tab}
                label={
                  tab === "home"
                    ? "Início"
                    : tab === "search"
                      ? "Pesquisar"
                      : "Perfil"
                }
                onClick={() => go(tab === "search" ? "map" : tab as Screen)}
                current={tab === active ? "page" : undefined}
                className={
                  tab === active
                    ? "relative -mt-1 h-14 w-16 flex-col gap-0.5 rounded-2xl text-background"
                    : "mt-1 h-14 w-16 flex-col gap-0.5 rounded-2xl text-foreground/65"
                }
              >
                {tab === active && (
                  <motion.span
                    layoutId="active-tab"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 30 }
                    }
                    className="absolute inset-0 rounded-2xl border border-background/15 bg-primary shadow-[0_6px_20px_var(--surface-shadow),inset_0_1px_0_var(--surface-highlight)]"
                  />
                )}
                <Icon
                  className="relative z-10"
                  size={tab === active ? 27 : 22}
                  strokeWidth={1.5}
                />
                <span className="relative z-10 text-[9px] font-semibold">
                  {tab === "home"
                    ? "Início"
                    : tab === "search"
                      ? "Explorar"
                      : "Perfil"}
                </span>
              </IconButton>
            </motion.div>
          )
        })}
      </nav>
    )
  }
  const internalTitles: Partial<Record<Screen, string>> = {
    signup: "Criar conta",
    accessibility: "Acessibilidade",
    login: "Entrar",
    verify: "Verificação",
    reset: "Redefinir senha",
    search: "Pesquisar",
    details: "Detalhes",
    reviews: "Avaliações",
    rate: "Sua avaliação",
    saved: "Desejo ir",
  }
  const Close = () => (
    <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 px-4">
      <IconButton label="Voltar" onClick={back}>
        <ArrowLeft size={22} strokeWidth={1.5} />
      </IconButton>
      <div className="min-w-0">
        <Eyebrow>Aondê</Eyebrow>
        <PageTitle className="truncate text-[1em]">
          {internalTitles[screen] || "Aondê"}
        </PageTitle>
      </div>
    </div>
  )
  const SearchBar = ({ active = false }: { active?: boolean }) => (
    <div className="glass mx-5 flex h-12 shrink-0 items-center rounded-2xl px-4">
      {active ? (
        <input
          type="search"
          enterKeyHint="search"
          autoFocus
          aria-label="Pesquisar museus"
          placeholder="Pesquisar museus"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setDistrict("")
              go("results")
            }
          }}
          className="w-full bg-transparent text-[.85em] outline-none"
        />
      ) : (
        <button
          onClick={() => go("search")}
          className="h-full flex-1 text-left text-[.85em] text-foreground/55"
        >
          {query || district || "Pesquisar museus"}
        </button>
      )}
      <IconButton
        label="Abrir filtros"
        onClick={() => setFilterSheet(true)}
        className="relative"
      >
        <SlidersHorizontal size={18} />
        {activeFilters > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-background">
            {activeFilters}
          </span>
        )}
      </IconButton>
      <IconButton
        label="Buscar"
        onClick={() => {
          setDistrict("")
          go("results")
        }}
      >
        <Search size={20} />
      </IconButton>
    </div>
  )
  const Chips = () => (
    <div className="my-4">
      <div className="hide-scroll flex gap-2 overflow-x-auto px-5">
        {types.map((type) => (
          <motion.button
            key={type}
            aria-pressed={filter === type}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            onClick={() => {
              setFilter(type)
              setDistrict("")
              // The map filters in place; elsewhere chips open the results.
              if (screen !== "map") go("results")
            }}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-[10px] font-semibold ${
              filter === type
                ? "border-primary bg-primary text-background shadow-sm"
                : "glass border-border"
            }`}
          >
            {type === "Tipos" ? "Todos" : type}
          </motion.button>
        ))}
        <motion.button
          aria-pressed={accessibleOnly}
          whileTap={reducedMotion ? undefined : { scale: 0.95 }}
          onClick={() => {
            setAccessibleOnly(!accessibleOnly)
            if (screen !== "map") go("results")
          }}
          className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[10px] font-semibold ${
            accessibleOnly
              ? "border-primary bg-primary text-background shadow-sm"
              : "glass border-border"
          }`}
        >
          <Accessibility size={14} />
          Acessível
        </motion.button>
        <motion.button
          whileTap={reducedMotion ? undefined : { scale: 0.95 }}
          onClick={() => setFilterSheet(true)}
          className="glass flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[10px] font-semibold"
        >
          <SlidersHorizontal size={14} />
          Mais filtros
        </motion.button>
      </div>
      {activeFilters > 0 && screen !== "map" && (
        <div className="mx-6 mt-3 flex items-center justify-between text-[10px]">
          <span className="font-semibold text-accent">
            {visible.length} {visible.length === 1 ? "museu encontrado" : "museus encontrados"}
          </span>
          <button
            onClick={clearFilters}
            className="min-h-11 px-2 underline decoration-accent/40 underline-offset-4"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  )
  const Gallery = ({
    items = visible,
    wideFirst = false,
  }: {
    items?: {
      image: string
      name: string
      index: number
      type?: string
      district?: string
      accessibility?: string[]
    }[]
    wideFirst?: boolean
  }) => (
    <div className="w-full">
      {Array.from({ length: Math.ceil(items.length / 2) }, (_, row) => (
        <div
          key={row}
          className={`grid gap-px border-b border-background ${
            (row % 2 === 0) === wideFirst
              ? "grid-cols-[3fr_2fr]"
              : "grid-cols-[2fr_3fr]"
          }`}
        >
          {items.slice(row * 2, row * 2 + 2).map((item, cell) => (
            <motion.button
              key={`${item.name}-${cell}`}
              onClick={() => openMuseum(item.index)}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: cell * 0.05 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              className="group relative h-[188px] overflow-hidden"
            >
              <MuseumPhoto
                key={item.image}
                alt={photoAlt(item.name)}
                src={item.image}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-3 text-left text-white">
                <span className="block text-xs font-semibold leading-tight">
                  {item.name}
                </span>
                {(item.type || item.district) && (
                  <span className="mt-1 block text-[9px] text-white/75">
                    {[item.type, item.district].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              {isSaved(item.index) && (
                <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md">
                  <Bookmark size={15} fill="currentColor" />
                </span>
              )}
              {Boolean(item.accessibility?.length) && (
                <span
                  title="Possui recursos de acessibilidade"
                  className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md"
                >
                  <Accessibility size={15} aria-label="Possui recursos de acessibilidade" />
                </span>
              )}
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  )
  const Stars = ({ value, size = 13 }: { value: number; size?: number }) => (
    <span className="flex gap-0.5 text-accent" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((score) => (
        <Star
          key={score}
          size={size}
          strokeWidth={1.6}
          fill={score <= value ? "currentColor" : "none"}
        />
      ))}
    </span>
  )
  const MyReviewCard = ({
    museumName,
    scores,
  }: {
    museumName?: string
    scores: number[]
  }) => (
    <article className="glass rounded-[1.5rem] p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/60 text-accent">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={18} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <CardTitle className="truncate">
            {museumName ?? (nickname || user?.name || "Você")}
          </CardTitle>
          <Caption className="mt-0.5 block">Aguardando moderação</Caption>
        </span>
        <span className="rounded-full bg-secondary/45 px-2.5 py-1 text-[.6em] font-bold">
          {(scores.reduce((sum, score) => sum + score, 0) / scores.length)
            .toFixed(1)
            .replace(".", ",")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {criteria.map((criterion, index) => (
          <div key={criterion}>
            <Caption className="block">{criterion}</Caption>
            <span className="mt-1 flex items-center gap-1.5">
              {Stars({ value: scores[index] })}
              <span className="sr-only">{scores[index]} de 5</span>
            </span>
          </div>
        ))}
      </div>
    </article>
  )
  const NoReviews = () => (
    <div className="glass flex flex-col items-center rounded-[1.5rem] px-6 py-7 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/45 text-accent">
        <Star size={22} strokeWidth={1.5} />
      </span>
      <CardTitle className="mt-4">Ainda não há avaliações publicadas</CardTitle>
      <BodyText className="mt-1.5 max-w-[250px]">
        Visitou o {current.name}? Conte como foi e ajude outras pessoas a
        escolher.
      </BodyText>
      <button
        onClick={startRating}
        className="mt-5 min-h-11 rounded-2xl bg-primary px-5 text-[.72em] font-semibold text-background"
      >
        Avaliar este museu
      </button>
    </div>
  )
  const ReviewLens = ({ more = false }: { more?: boolean }) => (
    <section className="px-5 pt-3">
      {myRatings ? MyReviewCard({ scores: myRatings }) : NoReviews()}
      {more && myRatings && (
        <button
          onClick={() => go("reviews")}
          className="mx-auto mt-3 flex min-h-11 items-center gap-1.5 text-[.72em] font-semibold text-accent"
        >
          Ver avaliações
          <ArrowRight size={15} />
        </button>
      )}
    </section>
  )
  const Hero = ({ details = false }: { details?: boolean }) => {
    const slideCount = details ? photos.length : homeList.length
    const credit = details ? photoCredits[photo % photos.length] : current.imageCredit
    return (
    <section className="relative isolate mx-4 my-5">
      <div className="relative flex items-center">
        {slideCount > 1 && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-black/25 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur-md">
            {details ? photo + 1 : homeList.indexOf(museum) + 1} de {slideCount}
          </div>
        )}
        <IconButton
          label={
            isSaved(museum)
              ? "Remover da lista de desejos"
              : "Adicionar à lista de desejos"
          }
          onClick={() => toggleSaved(museum)}
          className="absolute right-3 top-3 z-20 border border-white/20 bg-black/25 text-white backdrop-blur-md"
        >
          <Bookmark
            size={18}
            fill={isSaved(museum) ? "currentColor" : "none"}
          />
        </IconButton>
        {slideCount > 1 && (
          <IconButton
            label={details ? "Foto anterior" : "Museu anterior"}
            onClick={() => stepSlide(-1, details)}
            className="absolute left-2.5 top-[40%] z-10 -translate-y-1/2 border border-white/25 bg-black/25 text-white backdrop-blur-md hover:bg-black/40"
          >
            <ArrowLeft size={18} />
          </IconButton>
        )}
        <MuseumSlide
          slideId={`${museum}-${details ? photo : "museum"}`}
          src={details ? photos[photo % photos.length] : current.image}
          alt={photoAlt(current.name)}
          direction={slideDirection}
          onStep={(step) => stepSlide(step, details)}
          onOpen={details ? undefined : () => openMuseum(museum)}
          overlay={
            <>
              <div className="mb-2.5 flex items-center gap-2 text-[.58em] font-semibold uppercase tracking-[.14em]">
                <span className="rounded-full border border-white/30 bg-white/15 px-2.5 py-1 backdrop-blur-md">
                  {current.type}
                </span>
                <span className="flex min-w-0 items-center gap-1 truncate">
                  <MapPin size={12} className="shrink-0" />
                  {current.district}
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                  {current.accessibility.length > 0 && (
                    <span
                      title="Possui recursos de acessibilidade"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/30 backdrop-blur-md"
                    >
                      <Accessibility
                        size={13}
                        aria-label="Possui recursos de acessibilidade"
                      />
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 normal-case tracking-normal backdrop-blur-md">
                    {!details && homeTab === "visited" ? (
                      <>
                        <Footprints size={11} />
                        {current.visits}{" "}
                        {current.visits === 1 ? "visita" : "visitas"}
                      </>
                    ) : (
                      <>
                        <Star size={11} fill="currentColor" />
                        {current.rating === null ? "Novo" : ratingText}
                      </>
                    )}
                  </span>
                </span>
              </div>
              <motion.h1
                key={current.name}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="line-clamp-2 font-serif text-[1.35em] font-bold leading-[1.1] text-balance"
              >
                {current.name}
              </motion.h1>
            </>
          }
        />
        {slideCount > 1 && (
          <IconButton
            label={details ? "Próxima foto" : "Próximo museu"}
            onClick={() => stepSlide(1, details)}
            className="absolute right-2.5 top-[40%] z-10 -translate-y-1/2 border border-white/25 bg-black/25 text-white backdrop-blur-md hover:bg-black/40"
          >
            <ArrowRight size={18} />
          </IconButton>
        )}
      </div>
      {credit && (
        <p className="mt-1.5 px-3 text-right text-[.55em] leading-snug text-foreground/55">
          {credit.url ? (
            <a
              href={credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-foreground/25 underline-offset-2 hover:text-foreground/80"
            >
              {credit.text}
            </a>
          ) : (
            credit.text
          )}
        </p>
      )}
    </section>
    )
  }
  const hasBottom = ["home", "map", "results", "profile"].includes(screen)
  const hasHeader = ["home", "map", "results"].includes(screen)

  return (
    // Phones: the app fills the visible screen and the page itself never
    // scrolls. Larger screens: a phone-sized frame centered on the page.
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-[#d9d6d0] sm:h-auto sm:min-h-dvh sm:overflow-visible sm:p-7">
      <div
        data-theme={dark ? "dark" : "light"}
        onPointerDownCapture={event => {
          skipTapBlocked.current = false
          if (screen !== "welcome" || !introVisible) return
          finishIntro()
          if ((event.target as Element).closest("button:disabled")) {
            skipTapBlocked.current = true
            event.preventDefault()
            event.stopPropagation()
          }
        }}
        onClickCapture={event => {
          if (!skipTapBlocked.current) return
          skipTapBlocked.current = false
          event.preventDefault()
          event.stopPropagation()
        }}
        style={{ fontSize: `${size}px` }}
        className="canvas relative flex h-full w-full flex-col sm:h-[844px] sm:max-h-[calc(100dvh_-_3.5rem)] sm:w-[390px] overflow-hidden text-foreground shadow-[0_24px_100px_#302a2420] sm:rounded-[40px]"
      >
        {hasHeader && (
          <motion.div
            initial={false}
            animate={{
              marginTop: headerHidden ? -104 : 0,
              opacity: headerHidden ? 0 : 1,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            inert={headerHidden}
            className="relative z-20 shrink-0"
          >
            {Header()}
          </motion.div>
        )}
        {!hasHeader && !["welcome", "profile"].includes(screen) && Close()}
        <motion.div
          key={screen}
          ref={scrollRef}
          initial={
            reducedMotion || screen === "welcome"
              ? false
              : { opacity: 0, x: 16 }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onScroll={(event) => {
            const top = event.currentTarget.scrollTop
            scrollPositions.current[screen] = top
            // Background behind the home tabs only once they stick to the top:
            // the marker right above them has scrolled past the container top.
            const marker = homeTabsRef.current
            if (marker)
              setHomeTabsStuck(
                marker.getBoundingClientRect().top <=
                  event.currentTarget.getBoundingClientRect().top + 1,
              )
            if (!hasHeader) return
            const delta = top - lastScrollTop.current
            lastScrollTop.current = top
            // Hiding the header resizes this container, which fires its own
            // scroll events; ignore them briefly so the header doesn't bounce.
            if (performance.now() < headerLockedUntil.current) return
            const hide =
              top > 120 && delta > 4
                ? true
                : delta < -4 || top < 40
                  ? false
                  : headerHidden
            if (hide !== headerHidden) {
              setHeaderHidden(hide)
              headerLockedUntil.current = performance.now() + 320
            }
          }}
          className={`hide-scroll min-h-0 flex-1 ${
            // The map screen manages its own layout (map + draggable sheet).
            screen === "map"
              ? "overflow-hidden pb-[env(safe-area-inset-bottom)]"
              : `overflow-y-auto ${
                  hasBottom
                    ? "pb-[calc(7rem_+_env(safe-area-inset-bottom))]"
                    : screen === "welcome"
                      ? ""
                      : "pb-[calc(2rem_+_env(safe-area-inset-bottom))]"
                }`
          }`}
        >
          {screen === "welcome" && (
            <WelcomeIntro
              playIntro={introVisible}
              onComplete={finishIntro}
              onLogin={() => { finishIntro(); setSignup(false); go("login") }}
              onSignup={startSignup}
              onGuest={() => {
                finishIntro()
                setSignup(false)
                if (authenticated) signOut()
                go("home")
              }}
            />
          )}
          {screen === "signup" && (
            <form
              className="px-6 pt-7"
              onSubmit={(event) => {
                event.preventDefault()
                if (pending) return
                const form = new FormData(event.currentTarget)
                startTransition(async () => {
                  const result = await createAccount({
                    name: form.get("name"),
                    email: form.get("email"),
                    password: form.get("password"),
                  })
                  if (!result.ok) return notify(result.error, "error")
                  applySession(result.session)
                  notify("Conta criada. Boas-vindas ao Aondê!", "success")
                  go("accessibility")
                })
              }}
            >
              <FormIntro eyebrow="Bem-vindo ao Aondê" title="Crie sua conta">
                Salve museus, publique avaliações e acompanhe sua jornada
                cultural por Curitiba.
              </FormIntro>
              <div className="space-y-4">
                <Field
                  label="Nome"
                  name="name"
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                  required
                />
                <Field
                  label="E-mail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  required
                />
                <div>
                  <Field
                    label="Senha"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo de 8 caracteres"
                    minLength={8}
                    required
                  />
                  <Caption className="mt-2 block">
                    Foto, apelido e preferências podem ser adicionados depois
                    no seu perfil.
                  </Caption>
                </div>
              </div>
              <div className="pt-8">
                <ArrowButton label="Criar conta" disabled={pending} />
              </div>
              <p className="mt-5 text-center text-[.72em] text-foreground/70">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSignup(false)
                    go("login")
                  }}
                  className="min-h-11 font-semibold text-accent underline decoration-accent/40 underline-offset-4"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}
          {screen === "accessibility" && (
            <div className="px-6 pt-7">
              <FormIntro eyebrow="Preferências" title="Deixe do seu jeito">
                Ajuste a leitura do aplicativo. Você pode mudar isso depois no
                seu perfil.
              </FormIntro>
              <div className="space-y-3">
                <section className="glass rounded-[1.5rem] p-4">
                  <CardTitle>Tamanho do texto</CardTitle>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[.75em] font-semibold" aria-hidden="true">
                      Aa
                    </span>
                    <input
                      aria-label="Tamanho do texto"
                      type="range"
                      min="14"
                      max="20"
                      value={size}
                      onChange={(event) => setSize(Number(event.target.value))}
                      className="w-full accent-[var(--accent)]"
                    />
                    <span className="text-[1.25em] font-semibold" aria-hidden="true">
                      Aa
                    </span>
                  </div>
                </section>
                <section className="glass rounded-[1.5rem] p-4">
                  <CardTitle>Tema</CardTitle>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[false, true].map((isDark) => (
                      <button
                        key={String(isDark)}
                        aria-pressed={dark === isDark}
                        onClick={() => setDark(isDark)}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-left text-[.75em] font-semibold ${
                          dark === isDark
                            ? "border-primary bg-primary/10"
                            : "border-border bg-field"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-8 w-8 shrink-0 rounded-full border border-border ${
                            isDark ? "bg-[#18231b]" : "bg-[var(--brand-cream)]"
                          }`}
                        />
                        {isDark ? "Escuro" : "Claro"}
                        {dark === isDark && (
                          <Check size={16} className="ml-auto text-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                </section>
                <section className="glass flex items-center gap-4 rounded-[1.5rem] p-4">
                  <span className="flex-1">
                    <CardTitle>Texto alternativo</CardTitle>
                    <Caption className="mt-1 block">
                      Descrições mais completas das fotos para leitores de tela.
                    </Caption>
                  </span>
                  <button
                    role="switch"
                    aria-checked={alt}
                    aria-label="Texto alternativo"
                    onClick={() => setAlt(!alt)}
                    className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${
                      alt ? "bg-primary" : "bg-foreground/15"
                    }`}
                  >
                    <motion.span
                      animate={{ x: alt ? 24 : 0 }}
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 500, damping: 30 }
                      }
                      className="h-6 w-6 rounded-full bg-background shadow"
                    />
                  </button>
                </section>
              </div>
              <div className="mt-8">
                <ArrowButton
                  label={signup ? "Continuar" : "Salvar preferências"}
                  onClick={() => (signup ? go("profile") : back())}
                />
              </div>
            </div>
          )}
          {screen === "login" && (
            <form
              className="px-6 pt-7"
              onSubmit={(event) => {
                event.preventDefault()
                if (pending) return
                const form = new FormData(event.currentTarget)
                startTransition(async () => {
                  const result = await login({
                    email: form.get("email"),
                    password: form.get("password"),
                  })
                  if (!result.ok) return notify(result.error, "error")
                  applySession(result.session)
                  go("home")
                })
              }}
            >
              <FormIntro eyebrow="Que bom te ver" title="Entre na sua conta">
                Acesse seus museus salvos, avaliações e sua jornada cultural.
              </FormIntro>
              <Field
                label="E-mail"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                required
              />
              <div className="mt-4">
                <Field
                  label="Senha"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  notify(
                    "A recuperação de senha ainda não está disponível.",
                    "info",
                  )
                }
                className="ml-auto mt-1 block min-h-11 text-[.7em] font-medium text-foreground/70 underline decoration-accent/40 underline-offset-4"
              >
                Esqueci a senha
              </button>
              <div className="mt-5">
                <ArrowButton label="Entrar" disabled={pending} />
              </div>
              <p className="mt-5 text-center text-[.72em] text-foreground/70">
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={startSignup}
                  className="min-h-11 font-semibold text-accent underline decoration-accent/40 underline-offset-4"
                >
                  Criar conta
                </button>
              </p>
            </form>
          )}
          {screen === "verify" && (
            <div className="px-6 pt-7">
              <FormIntro eyebrow="Segurança" title="Código de verificação">
                Digite o código de 4 dígitos que enviamos para o seu e-mail.
              </FormIntro>
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    aria-label={`Dígito ${index + 1}`}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => {
                      const next = [...code]
                      next[index] = event.target.value.replace(/\D/g, "")
                      setCode(next)
                      if (next[index])
                        (event.target
                          .nextElementSibling as HTMLInputElement)?.focus()
                    }}
                    className="h-16 w-14 rounded-2xl border border-border bg-field text-center text-2xl font-semibold outline-none transition-[border-color,box-shadow] focus:border-primary/60 focus:shadow-[0_0_0_4px_#3c65431a]"
                  />
                ))}
              </div>
              <p className="mt-6 text-center text-[.72em] text-foreground/70">
                Não recebeu?{" "}
                <button
                  onClick={() =>
                    notify(
                      "A verificação por código ainda não está disponível.",
                    )
                  }
                  className="min-h-11 font-semibold text-accent underline decoration-accent/40 underline-offset-4"
                >
                  Reenviar código
                </button>
              </p>
              <div className="mt-6">
                <ArrowButton
                  label="Verificar"
                  onClick={() => {
                    if (!code.every(Boolean)) {
                      notify(
                        "Preencha os quatro dígitos do código.",
                        "error",
                      )
                      return
                    }
                    // No SMS/e-mail provider yet: codes can't sign anyone in.
                    notify(
                      "A verificação por código ainda não está disponível. Entre com e-mail e senha.",
                      "info",
                    )
                    go("login")
                  }}
                />
              </div>
            </div>
          )}
          {screen === "reset" && (
            <form
              className="px-6 pt-7"
              onSubmit={(event) => {
                event.preventDefault()
                notify(
                  "A recuperação de senha ainda não está disponível.",
                  "info",
                )
                go("login")
              }}
            >
              <FormIntro eyebrow="Recuperar acesso" title="Crie uma nova senha">
                Escolha uma senha com pelo menos 8 caracteres.
              </FormIntro>
              <Field
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                minLength={8}
                required
              />
              <div className="mt-8">
                <ArrowButton label="Salvar nova senha" />
              </div>
            </form>
          )}
          {screen === "home" && (
            <>
              <section className="px-5 pb-5 pt-6">
                <Eyebrow>Curitiba cultural</Eyebrow>
                <DisplayTitle className="mt-2 max-w-[330px]">
                  O que você quer descobrir hoje?
                </DisplayTitle>
                <BodyText className="mt-3 max-w-[315px]">
                  Encontre arquitetura, memória e novas histórias perto de você.
                </BodyText>
              </section>
              {/* Sticks to the top once the header slides away (see onScroll). */}
              <div ref={homeTabsRef} aria-hidden="true" className="h-0" />
              <div
                className={`sticky top-0 z-10 transition-[background-color,box-shadow] duration-200 ${
                  homeTabsStuck
                    ? "bg-background/95 shadow-[0_6px_16px_#4c343014] backdrop-blur-md"
                    : ""
                }`}
              >
                <nav
                  aria-label="Destaques"
                  className="hide-scroll relative flex gap-1 overflow-x-auto px-3 pb-1.5 pt-3"
                >
                  {homeTabs.map(({ id, label }) => (
                    <button
                      key={id}
                      aria-pressed={homeTab === id}
                      onClick={(event) => {
                        // Switching tabs scrolls the page by itself (new list
                        // height, repositioning below). Only a real scroll up
                        // may bring the header back, so freeze it briefly.
                        headerLockedUntil.current = performance.now() + 700
                        selectHomeTab(id)

                        // Bring the tab into view horizontally only;
                        // scrollIntoView would also move the page vertically.
                        const button = event.currentTarget
                        const nav = button.parentElement!
                        const behavior = reducedMotion ? "instant" : "smooth"
                        const left = button.offsetLeft
                        const right = left + button.offsetWidth
                        if (left < nav.scrollLeft)
                          nav.scrollTo({ left: left - 12, behavior })
                        else if (right > nav.scrollLeft + nav.clientWidth)
                          nav.scrollTo({ left: right - nav.clientWidth + 12, behavior })

                        // With the tabs stuck at the top, start the new list
                        // right below them, like Pinterest does.
                        const container = scrollRef.current
                        const marker = homeTabsRef.current
                        if (container && marker && homeTabsStuck)
                          container.scrollTo({
                            top:
                              container.scrollTop +
                              marker.getBoundingClientRect().top -
                              container.getBoundingClientRect().top,
                            behavior: "instant",
                          })
                      }}
                      // Inner padding gives the focus ring room around the
                      // label and the underline.
                      className={`relative shrink-0 whitespace-nowrap rounded-xl px-2.5 pb-3.5 pt-2 text-[.9em] font-semibold transition-colors focus-visible:outline-offset-0 ${
                        homeTab === id
                          ? "text-foreground"
                          : "text-foreground/50 hover:text-foreground/75"
                      }`}
                    >
                      {label}
                      {homeTab === id && (
                        <motion.span
                          layoutId="home-tab"
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 420, damping: 34 }
                          }
                          className="absolute inset-x-2.5 bottom-1.5 h-[3px] rounded-full bg-foreground"
                        />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
              <Caption className="mx-6 mt-4 block" aria-live="polite">
                {homeTabs.find((tab) => tab.id === homeTab)?.hint}
              </Caption>
              {homeList.length ? (
                Hero({})
              ) : (
                <div className="glass mx-4 my-5 flex flex-col items-center rounded-[2rem] px-6 py-9 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/45 text-accent">
                    {homeTab === "community" ? (
                      <UsersRound size={22} strokeWidth={1.6} />
                    ) : (
                      <TrendingUp size={22} strokeWidth={1.6} />
                    )}
                  </span>
                  <CardTitle className="mt-4">
                    {homeTab === "community"
                      ? "Ainda não há avaliações publicadas"
                      : "Ainda não há visitas registradas"}
                  </CardTitle>
                  <BodyText className="mt-1.5 max-w-[260px]">
                    {homeTab === "community"
                      ? "Quando a comunidade avaliar os museus, os mais bem avaliados aparecem aqui."
                      : "Quando as pessoas registrarem visitas, os museus mais visitados aparecem aqui."}
                  </BodyText>
                  <button
                    onClick={() => selectHomeTab("app")}
                    className="mt-5 min-h-11 rounded-2xl bg-primary px-5 text-[.72em] font-semibold text-background"
                  >
                    Ver recomendações do app
                  </button>
                </div>
              )}
              <section className="px-5 pb-8 pt-1">
                <div className="mb-3">
                  <Eyebrow>Exploração rápida</Eyebrow>
                  <SectionTitle className="mt-1">Escolha um caminho</SectionTitle>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Arte", hint: "Museus de arte", icon: Palette },
                    { label: "História", hint: "Memória e acervo", icon: Landmark },
                    { label: "Matriz", hint: "Centro da cidade", icon: MapPin },
                  ].map(({ label, hint, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => {
                        if (label === "Matriz") {
                          setDistrict("Matriz")
                          setFilter("Tipos")
                        } else {
                          setFilter(label)
                          setDistrict("")
                        }
                        go("results")
                      }}
                      className="glass flex min-h-16 items-center gap-3 rounded-2xl p-3 text-left"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/45 text-accent">
                        <Icon size={18} strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0">
                        <CardTitle className="text-[.8em]">{label}</CardTitle>
                        <Caption className="mt-0.5 block">{hint}</Caption>
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => setFilterSheet(true)}
                    className="flex min-h-16 items-center gap-3 rounded-2xl bg-primary p-3 text-left text-background shadow-[0_10px_24px_#3c654333]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/15">
                      <SlidersHorizontal size={18} strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0">
                      <CardTitle className="text-[.8em] text-background">
                        Mais opções
                      </CardTitle>
                      <span className="mt-0.5 block text-[.62em] font-medium leading-[1.35] text-background/75">
                        Todos os filtros
                      </span>
                    </span>
                  </button>
                </div>
              </section>
              <section className="px-5 pb-8" aria-labelledby="journey-title">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <Eyebrow>Sua jornada</Eyebrow>
                    <SectionTitle id="journey-title" className="mt-1">
                      Curitiba cultural
                    </SectionTitle>
                  </div>
                  <Caption className="font-semibold">
                    {exploredDistricts} de {districts.length} regionais
                  </Caption>
                </div>
                <div className="glass overflow-hidden rounded-[1.75rem] p-4">
                  <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-secondary/35">
                    <motion.div
                      initial={false}
                      animate={{
                        width: `${(exploredDistricts / districts.length) * 100}%`,
                      }}
                      transition={{ duration: reducedMotion ? 0 : 0.45 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        value: visitedIndexes.length,
                        label: "visitados",
                        icon: Landmark,
                        action: () => go("profile"),
                      },
                      {
                        value: savedIndexes.length,
                        label: "quero ir",
                        icon: Bookmark,
                        action: () => go("saved"),
                      },
                      {
                        value: Object.keys(myReviews).length,
                        label: "avaliações",
                        icon: Star,
                        action: () => {
                          setProfileTab("Avaliações")
                          go("profile")
                        },
                      },
                    ].map(({ value, label, icon: Icon, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="min-h-20 rounded-2xl bg-secondary/25 p-2 text-center"
                      >
                        <Icon
                          size={16}
                          className="mx-auto mb-1.5 text-accent"
                        />
                        <span className="block text-sm font-bold">{value}</span>
                        <span className="mt-0.5 block text-[8px] uppercase tracking-wide text-foreground/60">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
              <section className="px-5 pb-8">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <Eyebrow>Para conhecer</Eyebrow>
                    <SectionTitle className="mt-1">Museus em alta</SectionTitle>
                  </div>
                  <Caption>Em Curitiba</Caption>
                </div>
                <button
                  onClick={() => openMuseum(0)}
                  className="group relative h-64 w-full overflow-hidden rounded-[1.75rem] text-left shadow-[0_12px_28px_var(--surface-shadow)]"
                >
                  <img
                    src={museums[0].image}
                    alt={photoAlt(museums[0].name)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-espresso)]/85 via-transparent to-[var(--brand-espresso)]/15" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-[var(--brand-cream)]">
                    <Eyebrow className="text-[var(--brand-sage)]">
                      {museums[0].type} · {museums[0].district}
                    </Eyebrow>
                    <CardTitle className="mt-2 text-[1.15em]">
                      {museums[0].name}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <Star size={14} fill="currentColor" />
                      <Caption className="text-[var(--brand-cream)]/75">
                        {museums[0].rating === null
                          ? "Ainda sem avaliações"
                          : `${formatRating(museums[0].rating)} · ${museums[0].reviewCount} avaliações`}
                      </Caption>
                    </div>
                  </div>
                </button>
              </section>
              <section className="pb-5">
                <div className="px-5">
                  <Eyebrow>Comunidade</Eyebrow>
                  <SectionTitle className="mt-1">
                    Experiências compartilhadas
                  </SectionTitle>
                </div>
                {ReviewLens({})}
              </section>
            </>
          )}
          {(screen === "map" || screen === "results") && (
            <div className={screen === "map" ? "flex h-full flex-col pt-4" : "pt-5"}>
              <div className="mb-4 px-5">
                <Eyebrow>
                  {screen === "map" ? "Explore Curitiba" : "Resultados"}
                </Eyebrow>
                <div className="mt-1 flex items-end justify-between gap-4">
                  <SectionTitle>
                    {screen === "map"
                      ? "Museus no mapa"
                      : district ||
                        (filter !== "Tipos"
                          ? filter
                          : accessibleOnly
                            ? "Museus acessíveis"
                            : "Todos os museus")}
                  </SectionTitle>
                  <Caption className="shrink-0">
                    {visible.length}{" "}
                    {visible.length === 1 ? "lugar" : "lugares"}
                  </Caption>
                </div>
              </div>
              {SearchBar({})}
              {Chips()}
              {screen === "results" ? (
                visible.length ? (
                  Gallery({})
                ) : (
                  <div className="mx-7 py-12 text-center">
                    <span className="glass mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-accent">
                      <Landmark size={27} strokeWidth={1.3} />
                    </span>
                    <p className="mt-4 text-sm font-semibold">
                      Nenhum museu encontrado
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/60">
                      Tente outra categoria ou remova os filtros ativos.
                    </p>
                    <button
                      onClick={() => {
                        clearFilters()
                        setQuery("")
                      }}
                      className="mt-5 min-h-11 rounded-2xl bg-primary px-5 text-xs font-semibold text-background"
                    >
                      Ver todos os museus
                    </button>
                  </div>
                )
              ) : (
                <div className="min-h-0 flex-1 overflow-hidden rounded-t-[1.75rem] border-t border-border">
                  <MapExplorer
                    museums={visible}
                    initialSelectedId={mapFocus}
                    onOpen={openMuseum}
                    onLocateError={(message) => notify(message, "error")}
                  />
                </div>
              )}
            </div>
          )}
          {screen === "search" && (
            <div className="pt-2">
              {SearchBar({ active: true })}
              {!query && (
                <section className="px-5 pt-5">
                  <Eyebrow className="mb-3">Buscar por regional</Eyebrow>
                  <div className="flex flex-wrap gap-2">
                    {["Todas", ...districts].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setDistrict(option === "Todas" ? "" : option)
                          setQuery("")
                          go("results")
                        }}
                        className={`min-h-10 rounded-full border px-3.5 text-[.66em] font-semibold ${
                          option === "Todas"
                            ? "border-primary bg-primary text-background"
                            : "border-border bg-field hover:border-primary/40"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <div className="px-5 pt-6">
                <Eyebrow className="mb-1">
                  {query ? "Resultados" : "Todos os museus"}
                </Eyebrow>
                {visible.map((item) => (
                    <button
                      key={item.index}
                      onClick={() => openMuseum(item.index)}
                      className="flex min-h-16 w-full items-center gap-3 border-b border-border py-2 text-left"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-xl object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <CardTitle className="truncate">{item.name}</CardTitle>
                        <Caption className="mt-0.5 block">
                          {item.type} · {item.district}
                        </Caption>
                      </span>
                      <ArrowRight size={15} className="shrink-0 text-accent" />
                    </button>
                  ))}
                {query && !visible.length && (
                  <p className="py-6 text-center text-[.75em] text-foreground/60">
                    Nenhum museu encontrado para “{query}”.
                  </p>
                )}
              </div>
            </div>
          )}
          {screen === "details" && (
            <>
              {Hero({ details: true })}
              <nav
                aria-label="Ações rápidas"
                className="mx-5 -mt-1 mb-5 grid grid-cols-4 gap-2"
              >
                {[
                  {
                    label: "Como chegar",
                    icon: Navigation,
                    href: directionsUrl,
                    primary: true,
                  },
                  { label: "Site", icon: Globe2, href: websiteUrl },
                  { label: "Instagram", icon: AtSign, href: instagramUrl },
                  { label: "Compartilhar", icon: Share2, onClick: shareMuseum },
                ].map(({ label, icon: Icon, href, onClick, primary }) => {
                  const content = (
                    <>
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          primary
                            ? "bg-primary text-background shadow-[0_8px_20px_#3c654333]"
                            : "border border-border bg-field text-accent"
                        }`}
                      >
                        <Icon size={20} strokeWidth={1.7} />
                      </span>
                      {label}
                    </>
                  )
                  const className =
                    "flex flex-col items-center gap-1.5 text-center text-[.6em] font-semibold"
                  if (onClick)
                    return (
                      <button key={label} onClick={onClick} className={className}>
                        {content}
                      </button>
                    )
                  return href ? (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {content}
                    </a>
                  ) : (
                    <span
                      key={label}
                      aria-disabled="true"
                      title={`${label} não informado`}
                      className={`${className} opacity-35`}
                    >
                      {content}
                    </span>
                  )
                })}
              </nav>
              <section className="glass relative z-10 mx-5 rounded-[1.75rem] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Eyebrow>Sobre o museu</Eyebrow>
                  <span className="flex items-center gap-1.5 rounded-full bg-secondary/45 px-2.5 py-1 text-[9px] font-semibold">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        openNow ? "bg-accent" : "bg-foreground/40"
                      }`}
                    />
                    {openNow ? "Aberto agora" : "Fechado agora"}
                  </span>
                </div>
                <BodyText>{current.description}</BodyText>
              </section>
              <section className="px-5 py-8">
                <div className="mb-4">
                  <Eyebrow>Informações essenciais</Eyebrow>
                  <SectionTitle className="mt-1">Planeje sua visita</SectionTitle>
                </div>
                <div className="grid grid-cols-2 gap-3">
                {detailItems
                  .slice(0, 3)
                  .map(({ label, text, icon: Icon }, index) => (
                  <div
                    key={label}
                    className={`rounded-2xl border border-border bg-secondary/20 p-4 ${
                      index === 0
                        ? "col-span-2 flex min-h-20 items-center gap-4"
                        : "min-h-28"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.5}
                      className={`shrink-0 text-accent ${
                        index === 0 ? "" : "mb-3"
                      }`}
                    />
                    <div>
                      <CardTitle>{label}</CardTitle>
                      <Caption className="mt-1 block whitespace-pre-line">
                        {text}
                      </Caption>
                    </div>
                  </div>
                ))}
                </div>
              </section>
              <section className="px-5 pb-8" aria-labelledby="accessibility-title">
                <div className="mb-4">
                  <Eyebrow>Acessibilidade</Eyebrow>
                  <SectionTitle id="accessibility-title" className="mt-1">
                    Recursos para sua visita
                  </SectionTitle>
                </div>
                {current.accessibility.length ? (
                  <ul className="grid grid-cols-2 gap-2.5">
                    {current.accessibility.map((feature) => {
                      const Icon = accessibilityIcons[feature] ?? Accessibility
                      return (
                        <li
                          key={feature}
                          className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-field p-3"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/45 text-accent">
                            <Icon size={17} strokeWidth={1.7} />
                          </span>
                          <span className="text-[.68em] font-semibold leading-snug">
                            {accessibilityLabel(feature)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div className="flex gap-3 rounded-2xl border border-dashed border-border p-4">
                    <Accessibility
                      size={20}
                      strokeWidth={1.6}
                      className="mt-0.5 shrink-0 text-foreground/45"
                    />
                    <BodyText className="text-[.72em]">
                      Ainda não temos informações de acessibilidade confirmadas
                      para este museu. Antes de ir, confirme com a equipe do
                      local.
                    </BodyText>
                  </div>
                )}
                {current.accessibility.length > 0 && (
                  <Caption className="mt-3 block">
                    Informações podem mudar. Na dúvida, confirme com o museu.
                  </Caption>
                )}
              </section>
              <div className="px-5">
                <Eyebrow className="mb-3">Localização</Eyebrow>
                <div className="glass overflow-hidden rounded-2xl">
                  <div className="flex items-center gap-3 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/45 text-accent">
                      <MapPin size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <CardTitle>{current.district}</CardTitle>
                      <Caption className="mt-1 block">{current.address}</Caption>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 border-t border-border text-[.7em] font-semibold">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-12 items-center justify-center gap-2 text-accent hover:bg-secondary/25"
                    >
                      <Navigation size={15} />
                      Como chegar
                    </a>
                    <button
                      onClick={() => {
                        clearFilters()
                        setQuery("")
                        setMapFocus(current.id)
                        go("map")
                      }}
                      className="flex min-h-12 items-center justify-center gap-2 border-l border-border hover:bg-secondary/25"
                    >
                      <MapPin size={15} className="text-accent" />
                      Ver no mapa
                    </button>
                  </div>
                </div>
                <button
                  onClick={startRating}
                  className="mt-8 flex min-h-20 w-full items-center gap-4 rounded-[1.5rem] bg-primary p-4 text-left text-background shadow-[0_12px_28px_#3c654333]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/15 text-[var(--brand-sage)]">
                    <Star size={24} strokeWidth={1.5} />
                  </span>
                  <span className="flex-1">
                    <CardTitle className="text-background">
                      {hasRated
                        ? "Atualizar sua avaliação"
                        : "Compartilhe sua experiência"}
                    </CardTitle>
                    <Caption className="mt-1 block text-background/70">
                      Avalie acervo, acessibilidade, estrutura e atendimento
                    </Caption>
                  </span>
                  <ArrowRight size={18} className="shrink-0" />
                </button>
              </div>
              <section className="pb-4 pt-8">
                <div className="px-5">
                  <Eyebrow>Comunidade</Eyebrow>
                  <SectionTitle className="mt-1">Avaliações</SectionTitle>
                </div>
                {ReviewLens({ more: true })}
              </section>
            </>
          )}
          {screen === "reviews" && (
            <div className="pt-5">
              <section className="glass mx-5 flex items-center gap-4 rounded-[1.5rem] p-4">
                <img
                  src={current.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <CardTitle className="line-clamp-2">{current.name}</CardTitle>
                  <div className="mt-1.5 flex items-center gap-2">
                    {Stars({ value: Math.round(current.rating ?? 0) })}
                    <Caption>
                      {current.rating === null
                        ? "Ainda sem nota"
                        : `${ratingText} · ${current.reviewCount} avaliações`}
                    </Caption>
                  </div>
                </div>
              </section>
              {ReviewLens({})}
            </div>
          )}
          {screen === "rate" && (
            <>
              <div className="mb-6 px-6 pt-6">
                <Eyebrow>Compartilhe sua visita</Eyebrow>
                <SectionTitle className="mt-1">
                  Conte como foi sua experiência
                </SectionTitle>
                <p
                  className="mt-3 text-[.62em] font-semibold uppercase tracking-[.12em] text-accent"
                  aria-live="polite"
                >
                  {ratings.filter(Boolean).length} de {criteria.length} critérios
                  preenchidos
                </p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary/35">
                  <motion.div
                    animate={{
                      width: `${(ratings.filter(Boolean).length / criteria.length) * 100}%`,
                    }}
                    transition={{ duration: reducedMotion ? 0 : 0.25 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
              <div className="space-y-3 px-5">
                {criteria.map((criterion, index) => (
                  <div key={criterion} className="glass rounded-[1.25rem] px-3 pb-2 pt-3">
                    <div className="mb-1 flex items-center justify-between px-2">
                      <CardTitle>{criterion}</CardTitle>
                      <Caption>
                        {["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"][ratings[index]]}
                      </Caption>
                    </div>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <motion.button
                          key={score}
                          aria-label={`${criterion}: ${score} estrelas`}
                          aria-pressed={ratings[index] === score}
                          whileTap={reducedMotion ? undefined : { scale: 0.85 }}
                          onClick={() =>
                            setRatings(
                              ratings.map((rating, ratingIndex) =>
                                ratingIndex === index ? score : rating,
                              ),
                            )
                          }
                          className="flex h-11 w-11 items-center justify-center text-accent"
                        >
                          <motion.span
                            animate={{
                              scale:
                                reducedMotion || score > ratings[index]
                                  ? 1
                                  : [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 0.3,
                              delay: (score - 1) * 0.035,
                            }}
                          >
                            <Star
                              size={28}
                              strokeWidth={1.4}
                              fill={
                                score <= ratings[index]
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </motion.span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 pt-6">
                <Eyebrow className="mb-3">Fotos da visita (opcional)</Eyebrow>
                <div className="grid grid-cols-3 gap-2">
                  {uploads.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Sua foto ${index + 1}`}
                      className="aspect-square w-full rounded-2xl object-cover"
                    />
                  ))}
                  <button
                    onClick={choosePhoto}
                    className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-primary/35 bg-field text-[.62em] font-semibold text-accent"
                  >
                    <ImagePlus size={22} strokeWidth={1.5} />
                    Adicionar
                  </button>
                </div>
              </div>
              <div className="px-5 py-8">
                <ArrowButton
                  label="Enviar avaliação"
                  disabled={pending}
                  onClick={() => {
                    if (ratings.some((rating) => !rating))
                      return notify(
                        "Avalie os quatro critérios antes de enviar.",
                        "error",
                      )
                    if (!requireAccount("Cadastre-se ou entre para avaliar museus."))
                      return
                    const target = current
                    startTransition(async () => {
                      const result = await submitReview({
                        museumId: target.id,
                        ratings,
                      })
                      if (!result.ok) return notify(result.error, "error")
                      setMyReviews((previous) => ({
                        ...previous,
                        [target.id]: result.ratings,
                      }))
                      setVisited((previous) =>
                        previous.includes(target.id)
                          ? previous
                          : [...previous, target.id],
                      )
                      notify(
                        "Avaliação enviada! Ela aparece para todos depois da moderação.",
                        "success",
                      )
                      go("details")
                    })
                  }}
                />
              </div>
            </>
          )}
          {screen === "profile" && (
            <>
              <section className="flex items-end justify-between px-5 pb-2 pt-5">
                <div>
                  <Eyebrow>Seu espaço</Eyebrow>
                  <PageTitle className="mt-1">Minha jornada</PageTitle>
                </div>
                <IconButton
                  label="Configurações de acessibilidade"
                  onClick={() => go("accessibility")}
                  className="glass rounded-2xl"
                >
                  <Accessibility size={20} />
                </IconButton>
              </section>
              <section className="relative" aria-label="Foto e apelido do perfil">
              <button
                onClick={choosePhoto}
                disabled={!authenticated}
                aria-label="Alterar foto de perfil"
                className={`glass mx-auto mt-6 flex h-28 w-28 flex-col items-center justify-center gap-1 overflow-hidden rounded-[2rem] text-accent ${!authenticated ? "select-none blur-md" : ""}`}
              >
                {authenticated && avatar ? (
                  <img
                    src={avatar}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus size={24} strokeWidth={1.5} />
                    <span className="text-[.6em] font-semibold">Adicionar foto</span>
                  </>
                )}
              </button>
              <div className="mt-6 px-5">
                <div className={!authenticated ? "select-none blur-md" : ""}>
                  <Field
                    label="Apelido"
                    placeholder="Como você quer aparecer"
                    value={authenticated ? nickname : "Seu apelido"}
                    disabled={!authenticated}
                    onChange={(value) => {
                      if (!authenticated) return
                      setNickname(value)
                    }}
                    onBlur={() => {
                      if (!user || nickname.trim() === user.nickname) return
                      startTransition(async () => {
                        const result = await updateNickname(nickname)
                        if (!result.ok) return notify(result.error, "error")
                        setNickname(result.nickname)
                        setUser({ ...user, nickname: result.nickname })
                        notify("Apelido salvo.", "success")
                      })
                    }}
                  />
                </div>
              </div>
              {!authenticated && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
                  <div className="glass pointer-events-auto w-full rounded-[1.5rem] p-5 text-center">
                    <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/45 text-accent">
                      <LockKeyhole size={20} aria-hidden="true" />
                    </span>
                    <CardTitle>Um perfil com a sua cara</CardTitle>
                    <BodyText className="mt-1.5">
                      Cadastre-se para adicionar sua foto e escolher seu apelido.
                    </BodyText>
                    <button onClick={startSignup} className="mt-4 min-h-11 w-full rounded-2xl bg-primary px-4 text-[.72em] font-semibold text-background">Criar minha conta</button>
                  </div>
                </div>
              )}
              </section>
              <section className="glass mx-5 mt-6 rounded-[1.5rem] p-4">
                <Eyebrow>Progresso cultural</Eyebrow>
                <div className="mt-3 grid grid-cols-3 divide-x divide-border">
                  {[
                    { value: visitedIndexes.length, label: "Visitados" },
                    { value: exploredDistricts, label: "Regionais" },
                    {
                      value: savedIndexes.length,
                      label: "Quero ir",
                      action: () => go("saved"),
                    },
                  ].map(({ value, label, action }) => {
                    const content = (
                      <>
                        <span className="block text-[1.2em] font-bold">
                          {value}
                        </span>
                        <Caption className="mt-0.5 block">{label}</Caption>
                      </>
                    )
                    return action ? (
                      <button
                        key={label}
                        onClick={action}
                        className="min-h-11 px-2 text-center"
                      >
                        {content}
                      </button>
                    ) : (
                      <div key={label} className="px-2 text-center">
                        {content}
                      </div>
                    )
                  })}
                </div>
              </section>
              <div className="my-6 flex justify-center gap-2 px-4">
                {["Visitados", "Quero ir", "Avaliações"].map(
                  (tab) => (
                    <motion.button
                      key={tab}
                      aria-pressed={profileTab === tab}
                      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                      onClick={() => setProfileTab(tab)}
                      className={`relative isolate min-h-10 rounded-full border px-4 text-[.68em] font-semibold ${
                        profileTab === tab
                          ? "border-primary text-background"
                          : "border-border bg-field"
                      }`}
                    >
                      {profileTab === tab && (
                        <motion.span
                          layoutId="profile-tab"
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 420, damping: 32 }
                          }
                          className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                        />
                      )}
                      {tab}
                    </motion.button>
                  ),
                )}
              </div>
              {profileTab === "Avaliações" ? (
                <div className="space-y-3 px-5">
                  {museums
                    .filter((item) => myReviews[item.id])
                    .map((item) => (
                      <div key={item.id}>
                        {MyReviewCard({
                          museumName: item.name,
                          scores: myReviews[item.id],
                        })}
                      </div>
                    ))}
                  {!Object.keys(myReviews).length && (
                    <p className="py-8 text-center text-[.75em] text-foreground/60">
                      Suas avaliações aparecem aqui depois que você avaliar um
                      museu.
                    </p>
                  )}
                </div>
              ) : (profileTab === "Visitados" ? visitedIndexes : savedIndexes)
                  .length ? (
                Gallery({
                  wideFirst: true,
                  items: (profileTab === "Visitados"
                    ? visitedIndexes
                    : savedIndexes
                  ).map((index) => ({ ...museums[index], index })),
                })
              ) : (
                <p className="px-8 py-8 text-center text-[.75em] text-foreground/60">
                  {profileTab === "Visitados"
                    ? "Os museus que você avaliar entram na sua lista de visitados."
                    : "Toque no marcador de um museu para guardá-lo aqui."}
                </p>
              )}
            </>
          )}
          {screen === "saved" && (
            <>
              <section className="mb-7 px-5 pt-4">
                <Eyebrow>Próximos passeios</Eyebrow>
                <SectionTitle className="mt-1">
                  Lugares que você quer conhecer
                </SectionTitle>
                <BodyText className="mt-2">
                  {savedIndexes.length}{" "}
                  {savedIndexes.length === 1 ? "museu salvo" : "museus salvos"}
                </BodyText>
              </section>
              {savedIndexes.length ? (
                Gallery({
                  items: savedIndexes.map((index) => ({ ...museums[index], index })),
                })
              ) : (
                <div className="mx-7 py-12 text-center">
                  <span className="glass mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-accent">
                    <Bookmark size={27} strokeWidth={1.3} />
                  </span>
                  <p className="mt-4 text-sm font-semibold">
                    Sua lista está vazia
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/60">
                    Salve os museus que deseja conhecer para encontrá-los aqui.
                  </p>
                  <button
                    onClick={() => go("map")}
                    className="mt-5 min-h-11 rounded-2xl bg-primary px-5 text-xs font-semibold text-background"
                  >
                    Explorar museus
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
        {hasBottom &&
          Bottom({
            active:
              screen === "home"
                ? "home"
                : screen === "profile"
                  ? "profile"
                  : "search",
          })}
        <AnimatePresence>
          {menu && (
            <>
              <motion.button
                key="menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                aria-label="Fechar menu"
                onClick={() => setMenu(false)}
                className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[3px]"
              />
              <motion.div
                key="menu-panel"
                ref={menuRef}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                initial={{
                  opacity: 0,
                  y: reducedMotion ? 0 : -8,
                  scale: reducedMotion ? 1 : 0.96,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="absolute right-4 top-16 z-40 w-64 origin-top-right rounded-[1.5rem] border border-border bg-field p-2 shadow-[0_24px_48px_#4c34302e]"
              >
                <div className="mb-1 flex items-center gap-3 rounded-2xl bg-secondary/25 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/60 text-accent">
                    {authenticated && avatar ? (
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound size={19} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <CardTitle className="truncate">
                      {authenticated
                        ? nickname || user?.name
                        : "Visitante"}
                    </CardTitle>
                    <Caption className="mt-0.5 block truncate">
                      {authenticated
                        ? user?.email
                        : "Entre para salvar e avaliar"}
                    </Caption>
                  </span>
                </div>
                {[
                  { label: "Meu perfil", icon: UserRound, screen: "profile" },
                  {
                    label: "Desejo ir",
                    icon: Bookmark,
                    screen: "saved",
                    count: savedIndexes.length,
                  },
                  {
                    label: "Acessibilidade",
                    icon: Accessibility,
                    screen: "accessibility",
                  },
                ].map(({ label, icon: Icon, screen: target, count }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setSignup(false)
                      go(target as Screen)
                    }}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[.8em] font-medium hover:bg-secondary/30 focus-visible:bg-secondary/30 focus-visible:-outline-offset-2"
                  >
                    <Icon size={18} strokeWidth={1.7} className="text-accent" />
                    <span className="flex-1">{label}</span>
                    {Boolean(count) && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[.65em] font-bold text-background">
                        {count}
                      </span>
                    )}
                  </button>
                ))}
                <div className="mx-3 my-1 h-px bg-border" />
                {authenticated ? (
                  <button
                    onClick={() => {
                      setSignup(false)
                      signOut()
                      go("welcome")
                    }}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[.8em] font-medium text-foreground/75 hover:bg-secondary/30 focus-visible:bg-secondary/30 focus-visible:-outline-offset-2"
                  >
                    <LogOut size={18} strokeWidth={1.7} />
                    Sair da conta
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSignup(false)
                      go("login")
                    }}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[.8em] font-semibold text-accent hover:bg-secondary/30 focus-visible:bg-secondary/30 focus-visible:-outline-offset-2"
                  >
                    <LogIn size={18} strokeWidth={1.7} />
                    Entrar ou criar conta
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {filterSheet && (
            <>
              <motion.button
                key="filter-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                aria-label="Fechar filtros"
                onClick={() => setFilterSheet(false)}
                className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[3px]"
              />
              <motion.div
                key="filter-sheet"
                ref={filterRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-title"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : 60 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 360, damping: 32 }
                }
                className="glass absolute inset-x-3 bottom-[calc(0.75rem_+_env(safe-area-inset-bottom))] z-50 max-h-[76%] overflow-y-auto rounded-[1.75rem] p-5 pb-8"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p
                      id="filter-title"
                      className="font-serif text-[1.35em] font-semibold"
                    >
                      Filtrar museus
                    </p>
                    <p className="mt-1 text-[10px] text-foreground/60">
                      Refine por categoria e regional
                    </p>
                  </div>
                  <IconButton
                    label="Fechar filtros"
                    onClick={() => setFilterSheet(false)}
                  >
                    <X size={19} />
                  </IconButton>
                </div>
                <fieldset>
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[.13em] text-accent">
                    Categoria
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {types.map((type) => (
                      <button
                        key={type}
                        aria-pressed={filter === type}
                        onClick={() => setFilter(type)}
                        className={`min-h-11 rounded-full border px-4 text-[10px] font-semibold ${
                          filter === type
                            ? "border-primary bg-primary text-background"
                            : "border-border bg-background/35"
                        }`}
                      >
                        {type === "Tipos" ? "Todas" : type}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[.13em] text-accent">
                    Regional de Curitiba
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {["Todas", ...districts].map((option) => {
                      const selected =
                        option === "Todas" ? !district : district === option
                      return (
                        <button
                          key={option}
                          aria-pressed={selected}
                          onClick={() =>
                            setDistrict(option === "Todas" ? "" : option)
                          }
                          className={`min-h-11 rounded-xl border px-2 text-[9px] font-semibold ${
                            selected
                              ? "border-primary bg-primary text-background"
                              : "border-border bg-background/35"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="mb-3 text-[10px] font-bold uppercase tracking-[.13em] text-accent">
                    Acessibilidade
                  </legend>
                  <button
                    role="switch"
                    aria-checked={accessibleOnly}
                    onClick={() => setAccessibleOnly(!accessibleOnly)}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-border bg-background/35 px-3 text-left"
                  >
                    <Accessibility size={18} className="shrink-0 text-accent" />
                    <span className="flex-1 text-[.7em] font-semibold">
                      Somente museus com recursos de acessibilidade
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
                        accessibleOnly ? "bg-primary" : "bg-foreground/15"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-background shadow transition-transform ${
                          accessibleOnly ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                  </button>
                </fieldset>
                <div className="sticky bottom-0 mt-6 grid grid-cols-[1fr_1.5fr] gap-3">
                  <button
                    onClick={clearFilters}
                    className="glass min-h-12 rounded-2xl text-xs font-semibold"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => {
                      setFilterSheet(false)
                      go("results")
                    }}
                    className="min-h-12 rounded-2xl bg-primary px-4 text-xs font-semibold text-background"
                  >
                    Ver {visible.length}{" "}
                    {visible.length === 1 ? "resultado" : "resultados"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {notice && (
            <motion.div
              key={`${notice.tone}-${notice.text}`}
              initial={{
                opacity: 0,
                y: reducedMotion ? 0 : 16,
                scale: reducedMotion ? 1 : 0.97,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 28 }
              }
              role={notice.tone === "error" ? "alert" : "status"}
              className={`glass absolute inset-x-5 bottom-[calc(7rem_+_env(safe-area-inset-bottom))] z-[60] flex items-center gap-3 rounded-2xl p-4 text-xs leading-relaxed ${
                notice.tone === "error"
                  ? "border-accent"
                  : notice.tone === "warning"
                    ? "border-primary/50"
                    : ""
              }`}
            >
              {notice.tone === "success" ? (
                <Check size={20} className="shrink-0 text-accent" />
              ) : notice.tone === "error" ? (
                <X size={20} className="shrink-0 text-accent" />
              ) : notice.tone === "warning" ? (
                <LockKeyhole size={20} className="shrink-0 text-accent" />
              ) : (
                <CircleHelp size={20} className="shrink-0 text-accent" />
              )}
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={screen === "rate"}
          aria-label="Escolher foto"
          className="hidden"
          onChange={(event) => {
            if (!user) {
              event.target.value = ""
              return
            }
            const files = Array.from(event.target.files || [])
            files.forEach((file) => {
              const reader = new FileReader()
              reader.onload = () => {
                const image = String(reader.result)
                if (screen === "profile") {
                  setAvatar(image)
                  try {
                    localStorage.setItem(avatarKey(user.id), image)
                  } catch {
                    notify("Foto adicionada nesta sessão.", "info")
                  }
                } else setUploads((previous) => [...previous, image])
              }
              reader.readAsDataURL(file)
            })
            event.target.value = ""
          }}
        />
      </div>
    </main>
  )
}
export default Prototype
