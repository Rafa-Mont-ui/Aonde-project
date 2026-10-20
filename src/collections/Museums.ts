import type { CollectionConfig } from "payload"
import { isAdmin } from "../access/isAdmin"
import { accessibilityOptions } from "../lib/accessibility"
import { revalidateSite } from "../lib/revalidate"

export const Museums: CollectionConfig = {
  slug: "museums",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "district", "openStatus"],
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateSite()
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateSite()
        return doc
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "featured",
      type: "checkbox",
      label: "Recomendado pelo Aondê",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Aparece na aba “Recomendação do app” da tela inicial.",
      },
    },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "type",
      type: "select",
      required: true,
      options: ["Arte", "História", "Ciência", "Memória", "Outros"],
    },
    {
      name: "district",
      type: "select",
      required: true,
      options: [
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
      ],
    },
    { name: "description", type: "textarea", required: true },
    { name: "cover", type: "upload", relationTo: "media", required: true },
    {
      name: "gallery",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
    },
    { name: "openingHours", type: "text", required: true },
    { name: "ticketInfo", type: "text", required: true },
    { name: "exhibitionInfo", type: "text" },
    { name: "address", type: "text", required: true },
    { name: "website", type: "text" },
    { name: "instagram", type: "text" },
    { name: "latitude", type: "number" },
    { name: "longitude", type: "number" },
    {
      name: "accessibilityFeatures",
      type: "select",
      hasMany: true,
      options: accessibilityOptions.map(({ value, label }) => ({ value, label })),
      admin: {
        description:
          "Marque apenas recursos confirmados pelo museu ou pelo Guia de Acessibilidade da prefeitura.",
      },
    },
    {
      name: "openStatus",
      type: "select",
      defaultValue: "schedule",
      options: [
        { label: "Usar horário", value: "schedule" },
        { label: "Temporariamente fechado", value: "closed" },
      ],
    },
  ],
}
