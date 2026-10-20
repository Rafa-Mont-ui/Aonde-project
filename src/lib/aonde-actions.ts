"use server"

import { cookies, headers } from "next/headers"
import {
  createPayloadRequest,
  LockedAuth,
  logoutOperation,
  ValidationError,
  type Payload,
  type Where,
} from "payload"
import { getPayloadClient } from "@/lib/payload"
import type { User } from "@/payload-types"

export type SessionUser = {
  id: string
  name: string
  nickname: string
  email: string
}

export type AondeSession = {
  user: SessionUser | null
  /** Museum IDs the user saved to their "Desejo ir" list. */
  favorites: string[]
  /** Museum IDs the user has visited. */
  visits: string[]
  /** The user's own ratings per museum ID, in the order of the UI criteria. */
  reviews: Record<string, number[]>
}

type Failure = { ok: false; error: string }

const emptySession: AondeSession = {
  user: null,
  favorites: [],
  visits: [],
  reviews: {},
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

function tokenCookieName(payload: Payload) {
  return `${payload.config.cookiePrefix || "payload"}-token`
}

// Secure cookies need HTTPS, so they're only required in production;
// `next dev` on http://localhost keeps working.
const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const

async function getContext() {
  const payload = await getPayloadClient()
  const requestHeaders = await headers()
  // Next.js already rejects cross-origin Server Action calls, so Payload only
  // needs the session cookie plus the browser's Sec-Fetch-Site CSRF signal.
  // The Origin header is left out so Payload's CSRF allowlist doesn't need to
  // know every host the app is served from.
  const forwarded = new Headers({ cookie: requestHeaders.get("cookie") ?? "" })
  const fetchSite = requestHeaders.get("sec-fetch-site")
  if (fetchSite) forwarded.set("sec-fetch-site", fetchSite)
  const { user } = await payload.auth({ headers: forwarded })
  return { payload, user: user?.collection === "users" ? user : null }
}

async function setSessionCookie(payload: Payload, token: string, exp?: number) {
  const store = await cookies()
  store.set(tokenCookieName(payload), token, {
    ...cookieOptions,
    expires: exp ? new Date(exp * 1000) : undefined,
  })
}

async function museumExists(payload: Payload, id: unknown) {
  if (typeof id !== "string" || !id) return false
  const museum = await payload.findByID({
    collection: "museums",
    id,
    depth: 0,
    overrideAccess: false,
    disableErrors: true,
  })
  return Boolean(museum)
}

function ownedForMuseum(userId: string, museumId: string): Where {
  return {
    and: [{ owner: { equals: userId } }, { museum: { equals: museumId } }],
  }
}

function relationID(value: unknown) {
  if (value && typeof value === "object" && "id" in value)
    return String((value as { id: unknown }).id)
  return String(value)
}

async function loadSession(payload: Payload, user: User): Promise<AondeSession> {
  const scope = { overrideAccess: false, user, depth: 0, pagination: false } as const
  const ownedBy: Where = { owner: { equals: user.id } }
  const [favorites, visits, reviews] = await Promise.all([
    payload.find({ collection: "favorites", where: ownedBy, ...scope }),
    payload.find({ collection: "visits", where: ownedBy, ...scope }),
    payload.find({ collection: "reviews", where: ownedBy, ...scope }),
  ])

  return {
    user: {
      id: user.id,
      name: user.name,
      nickname: user.nickname ?? "",
      email: user.email,
    },
    favorites: [...new Set(favorites.docs.map((doc) => relationID(doc.museum)))],
    visits: [...new Set(visits.docs.map((doc) => relationID(doc.museum)))],
    reviews: Object.fromEntries(
      reviews.docs.map((doc) => [
        relationID(doc.museum),
        [
          doc.ratings.collection,
          doc.ratings.accessibility,
          doc.ratings.structure,
          doc.ratings.service,
        ],
      ]),
    ),
  }
}

export async function getSession(): Promise<AondeSession> {
  const { payload, user } = await getContext()
  return user ? loadSession(payload, user) : emptySession
}

async function startSession(
  payload: Payload,
  email: string,
  password: string,
): Promise<{ ok: true; session: AondeSession } | Failure> {
  try {
    const result = await payload.login({
      collection: "users",
      data: { email, password },
    })
    if (!result.token || !result.user) throw new Error("Missing token")
    await setSessionCookie(payload, result.token, result.exp)
    return { ok: true, session: await loadSession(payload, result.user) }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof LockedAuth
          ? "Muitas tentativas de acesso. Tente novamente em alguns minutos."
          : "E-mail ou senha incorretos.",
    }
  }
}

export async function signup(input: {
  name?: unknown
  email?: unknown
  password?: unknown
}) {
  const name = text(input.name, 80)
  const email = text(input.email, 254).toLowerCase()
  const password = typeof input.password === "string" ? input.password : ""

  if (!name) return { ok: false, error: "Informe seu nome." } satisfies Failure
  if (!emailPattern.test(email))
    return { ok: false, error: "Informe um e-mail válido." } satisfies Failure
  if (password.length < 8 || password.length > 128)
    return {
      ok: false,
      error: "A senha precisa ter pelo menos 8 caracteres.",
    } satisfies Failure

  const payload = await getPayloadClient()
  try {
    await payload.create({
      collection: "users",
      data: { name, email, password },
      overrideAccess: false,
    })
  } catch (error) {
    const fieldErrors =
      error instanceof ValidationError
        ? ((error.data as { errors?: { path?: string }[] } | null)?.errors ?? [])
        : []
    const duplicate = fieldErrors.some((fieldError) => fieldError.path === "email")
    return {
      ok: false,
      error: duplicate
        ? "Já existe uma conta com este e-mail. Tente entrar."
        : "Não foi possível criar sua conta agora. Tente novamente.",
    } satisfies Failure
  }

  return startSession(payload, email, password)
}

export async function login(input: { email?: unknown; password?: unknown }) {
  const email = text(input.email, 254).toLowerCase()
  const password = typeof input.password === "string" ? input.password : ""
  if (!email || !password)
    return { ok: false, error: "Informe e-mail e senha." } satisfies Failure

  const payload = await getPayloadClient()
  return startSession(payload, email, password)
}

export async function logout() {
  const { payload, user } = await getContext()
  if (user) {
    // Ends this session server-side so the old token stops working too.
    const req = await createPayloadRequest({ payload, user })
    await logoutOperation({ collection: payload.collections.users, req }).catch(
      () => undefined,
    )
  }
  const store = await cookies()
  store.delete({ name: tokenCookieName(payload), ...cookieOptions })
  return { ok: true as const }
}

export async function toggleFavorite(museumId: unknown) {
  const { payload, user } = await getContext()
  if (!user)
    return { ok: false, error: "Entre na sua conta para salvar museus." } satisfies Failure
  if (!(await museumExists(payload, museumId)))
    return { ok: false, error: "Museu não encontrado." } satisfies Failure

  const where = ownedForMuseum(user.id, museumId as string)
  const existing = await payload.find({
    collection: "favorites",
    where,
    depth: 0,
    limit: 1,
    overrideAccess: false,
    user,
  })

  if (existing.docs.length) {
    await payload.delete({ collection: "favorites", where, overrideAccess: false, user })
    return { ok: true as const, saved: false }
  }

  await payload.create({
    collection: "favorites",
    data: { owner: user.id, museum: museumId as string },
    overrideAccess: false,
    user,
  })
  return { ok: true as const, saved: true }
}

export async function submitReview(input: {
  museumId?: unknown
  ratings?: unknown
}) {
  const { payload, user } = await getContext()
  if (!user)
    return { ok: false, error: "Entre na sua conta para avaliar museus." } satisfies Failure

  const ratings = Array.isArray(input.ratings) ? input.ratings : []
  const valid =
    ratings.length === 4 &&
    ratings.every((score) => Number.isInteger(score) && score >= 1 && score <= 5)
  if (!valid)
    return {
      ok: false,
      error: "Avalie os quatro critérios com notas de 1 a 5.",
    } satisfies Failure
  if (!(await museumExists(payload, input.museumId)))
    return { ok: false, error: "Museu não encontrado." } satisfies Failure

  const museumId = input.museumId as string
  const [collection, accessibility, structure, service] = ratings as number[]
  const mine = ownedForMuseum(user.id, museumId)

  // A new review replaces the user's previous one for this museum and goes
  // back through moderation, so edits can't bypass approval.
  await payload.delete({ collection: "reviews", where: mine, overrideAccess: false, user })
  await payload.create({
    collection: "reviews",
    data: {
      owner: user.id,
      museum: museumId,
      ratings: { collection, accessibility, structure, service },
      status: "pending",
    },
    overrideAccess: false,
    user,
  })

  const visited = await payload.find({
    collection: "visits",
    where: mine,
    depth: 0,
    limit: 1,
    overrideAccess: false,
    user,
  })
  if (!visited.docs.length) {
    await payload.create({
      collection: "visits",
      data: {
        owner: user.id,
        museum: museumId,
        visitedAt: new Date().toISOString(),
      },
      overrideAccess: false,
      user,
    })
  }

  return {
    ok: true as const,
    ratings: [collection, accessibility, structure, service],
  }
}

export async function updateNickname(nickname: unknown) {
  const { payload, user } = await getContext()
  if (!user)
    return {
      ok: false,
      error: "Entre na sua conta para editar o perfil.",
    } satisfies Failure

  const value = text(nickname, 40)
  await payload.update({
    collection: "users",
    id: user.id,
    data: { nickname: value },
    overrideAccess: false,
    user,
  })
  return { ok: true as const, nickname: value }
}
