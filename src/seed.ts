/**
 * Local starter data: uploads the photos in public/aonde to Media and creates
 * a few Curitiba museums. Safe to run more than once; existing museums only get
 * missing coordinates filled in.
 *
 *   pnpm seed
 */
import path from "path"
import { getPayload } from "payload"
import config from "@payload-config"
import type { Museum } from "./payload-types"

type MuseumSeed = Omit<Museum, "id" | "cover" | "createdAt" | "updatedAt"> & {
  photo: string
}

const museums: MuseumSeed[] = [
  {
    name: "Museu Oscar Niemeyer",
    slug: "museu-oscar-niemeyer",
    type: "Arte",
    district: "Matriz",
    description:
      "Conhecido como Museu do Olho, reúne artes visuais, arquitetura e design em um dos edifícios mais icônicos de Curitiba.",
    photo: "museu-oscar-niemeyer.jpg",
    openingHours: "Ter. a dom., 10h às 18h",
    ticketInfo: "Ingresso pago, com gratuidade em dias específicos",
    exhibitionInfo: "Exposições de arte moderna e contemporânea",
    address: "R. Mal. Hermes, 999 - Centro Cívico, Curitiba - PR",
    latitude: -25.4101,
    longitude: -49.2672,
    // MON's ramps reach every part of the building; confirm other features with the museum.
    accessibilityFeatures: ["rampa"],
    website: "https://www.museuoscarniemeyer.org.br",
    instagram: "@museuoscarniemeyer",
  },
  {
    name: "Museu Paranaense",
    slug: "museu-paranaense",
    type: "História",
    district: "Matriz",
    description:
      "Um dos museus mais antigos do Brasil, com acervo de história, arqueologia e antropologia do Paraná.",
    photo: "museu-fachada.jpg",
    openingHours: "Ter. a dom., 10h às 17h30",
    ticketInfo: "Entrada gratuita",
    exhibitionInfo: "Acervo de história e antropologia",
    address: "R. Kellers, 289 - São Francisco, Curitiba - PR",
    latitude: -25.4278,
    longitude: -49.2761,
    website: "https://www.museuparanaense.pr.gov.br",
    instagram: "@museuparanaense",
  },
  {
    name: "Museu do Holocausto de Curitiba",
    slug: "museu-do-holocausto",
    type: "Memória",
    district: "Matriz",
    description:
      "Espaço de memória dedicado à história do Holocausto e à educação para os direitos humanos.",
    photo: "museu-arquitetura.jpg",
    openingHours: "Visitas mediante agendamento",
    ticketInfo: "Entrada gratuita com agendamento",
    address: "R. Cel. Agostinho Macedo, 248 - Bom Retiro, Curitiba - PR",
    latitude: -25.4152,
    longitude: -49.2722,
    website: "https://www.museudoholocausto.org.br",
    instagram: "@museudoholocausto",
  },
  {
    name: "Museu de História Natural Capão da Imbuia",
    slug: "museu-historia-natural-capao-da-imbuia",
    type: "Ciência",
    district: "Cajuru",
    description:
      "Museu dedicado à fauna, flora e geologia do Paraná, em meio a um bosque de araucárias.",
    photo: "curitiba-cultural.jpg",
    openingHours: "Ter. a dom., 9h às 16h45",
    ticketInfo: "Entrada gratuita",
    address: "R. Prof. Benedito Conceição, 407 - Capão da Imbuia, Curitiba - PR",
    latitude: -25.4367,
    longitude: -49.2191,
  },
]

const payload = await getPayload({ config })
const photosDir = path.resolve(process.cwd(), "public", "aonde")

for (const { photo, ...museum } of museums) {
  const existing = await payload.find({
    collection: "museums",
    where: { slug: { equals: museum.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const found = existing.docs[0]
  if (found) {
    // Only fill coordinates that are still empty, so admin edits are kept.
    if (found.latitude == null && found.longitude == null && museum.latitude != null) {
      await payload.update({
        collection: "museums",
        id: found.id,
        data: { latitude: museum.latitude, longitude: museum.longitude },
        overrideAccess: true,
      })
      payload.logger.info(`Added coordinates to ${museum.name}`)
    } else {
      payload.logger.info(`Skipping ${museum.name} (already exists)`)
    }
    continue
  }

  const cover = await payload.create({
    collection: "media",
    data: { alt: museum.name },
    filePath: path.join(photosDir, photo),
    overrideAccess: true,
  })
  await payload.create({
    collection: "museums",
    data: { ...museum, cover: cover.id },
    overrideAccess: true,
  })
  payload.logger.info(`Created ${museum.name}`)
}

payload.logger.info("Seed finished")
process.exit(0)
