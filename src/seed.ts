/**
 * Local starter data: uploads each museum's photos to Media and creates a few
 * Curitiba museums. Photos from Wikimedia Commons live in src/seed-photos and
 * keep the credit their license requires. Safe to run more than once; existing museums only get
 * missing coordinates filled in.
 *
 *   pnpm seed
 */
import path from "path"
import { getPayload } from "payload"
import config from "@payload-config"
import type { Museum } from "./payload-types"

type SeedPhoto = {
  /** Relative to the project root. */
  file: string
  alt: string
  credit?: string
  creditUrl?: string
}

type MuseumSeed = Omit<Museum, "id" | "cover" | "gallery" | "createdAt" | "updatedAt"> & {
  /** The first photo is the cover; the rest go to the gallery. */
  photos: SeedPhoto[]
}

const museums: MuseumSeed[] = [
  {
    name: "Museu Oscar Niemeyer",
    slug: "museu-oscar-niemeyer",
    type: "Arte",
    district: "Matriz",
    description:
      "Conhecido como Museu do Olho, reúne artes visuais, arquitetura e design em um dos edifícios mais icônicos de Curitiba.",
    photos: [
      { file: "public/aonde/museu-arquitetura.jpg", alt: "Museu Oscar Niemeyer, o Museu do Olho" },
      { file: "public/aonde/curitiba-cultural.jpg", alt: "Vista aérea do Museu Oscar Niemeyer" },
    ],
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
    photos: [
      {
        file: "src/seed-photos/paranaense-jardim.jpg",
        alt: "Museu Paranaense visto do jardim",
        credit: "Foto: Carlahcarolineferreira / Wikimedia Commons, CC BY-SA 4.0",
        creditUrl: "https://commons.wikimedia.org/wiki/File:Museu_Paranaense_do_jardim.jpg",
      },
      {
        file: "src/seed-photos/paranaense-fachada.jpg",
        alt: "Fachada do Museu Paranaense",
        credit: "Foto: Mimyuu / Wikimedia Commons, CC0",
        creditUrl: "https://commons.wikimedia.org/wiki/File:Museu_Paranaense_fa%C3%A7ade.jpg",
      },
      {
        file: "src/seed-photos/paranaense-entrada.jpg",
        alt: "Entrada do Museu Paranaense, no Largo da Ordem",
        credit: "Foto: Andressa Novo Lima / Wikimedia Commons, CC BY-SA 4.0",
        creditUrl: "https://commons.wikimedia.org/wiki/File:Museu_Paranaense_-_Largo_da_Ordem_Curitiba_(1).jpg",
      },
    ],
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
    photos: [
      {
        // The museum is inside the Beit Yaacov synagogue building.
        file: "src/seed-photos/holocausto-beit-yaacov.jpg",
        alt: "Entrada do prédio da Sinagoga Beit Yaacov, onde fica o Museu do Holocausto",
        credit: "Foto: Isacks1 / Wikimedia Commons, CC BY-SA 4.0 (recortada)",
        creditUrl: "https://commons.wikimedia.org/wiki/File:Centro_Israelita_do_Paran%C3%A1.jpg",
      },
    ],
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
    photos: [
      {
        file: "src/seed-photos/capao-predio.jpg",
        alt: "Prédio do Museu de História Natural no bosque",
        credit: "Foto: YuriNikolai / Wikimedia Commons, CC BY-SA 4.0",
        creditUrl: "https://commons.wikimedia.org/wiki/File:Museu_de_Hist%C3%B3ria_Natural_do_Cap%C3%A3o_da_Imbuia_building.jpg",
      },
      {
        file: "src/seed-photos/capao-araucaria.jpg",
        alt: "Araucária no Bosque do Capão da Imbuia",
        credit: "Foto: YuriNikolai / Wikimedia Commons, CC BY-SA 4.0",
        creditUrl: "https://commons.wikimedia.org/wiki/File:Araucaria_Bosque_do_Cap%C3%A3o_da_Imbuia.jpg",
      },
      {
        file: "src/seed-photos/capao-portao.jpg",
        alt: "Portão de entrada do Bosque do Capão da Imbuia",
        credit: "Foto: J.M.Guimarães / Wikimedia Commons, domínio público",
        creditUrl: "https://commons.wikimedia.org/wiki/File:Nivaldo_Braga_Museu_Hist%C3%B3ria_Natural.JPG",
      },
    ],
    openingHours: "Ter. a dom., 9h às 16h45",
    ticketInfo: "Entrada gratuita",
    address: "R. Prof. Benedito Conceição, 407 - Capão da Imbuia, Curitiba - PR",
    latitude: -25.4367,
    longitude: -49.2191,
  },
]

const payload = await getPayload({ config })

for (const { photos, ...museum } of museums) {
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

  // One upload at a time: SQLite allows a single writer.
  const uploaded = []
  for (const { file, ...data } of photos) {
    uploaded.push(
      await payload.create({
        collection: "media",
        data,
        filePath: path.resolve(process.cwd(), file),
        overrideAccess: true,
      }),
    )
  }
  const [cover, ...gallery] = uploaded
  await payload.create({
    collection: "museums",
    data: { ...museum, cover: cover.id, gallery: gallery.map((photo) => photo.id) },
    overrideAccess: true,
  })
  payload.logger.info(`Created ${museum.name}`)
}

payload.logger.info("Seed finished")
process.exit(0)
