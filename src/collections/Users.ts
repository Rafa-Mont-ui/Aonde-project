import type { CollectionConfig } from "payload"

const isAppUser = ({ req }: { req: { user?: { collection?: string; id?: unknown } | null } }) =>
  req.user?.collection === "users"

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    // Keep app visitors signed in for 30 days instead of Payload's 2h default.
    tokenExpiration: 60 * 60 * 24 * 30,
  },
  admin: {
    hidden: true,
    useAsTitle: "email",
  },
  access: {
    create: () => true,
    read: ({ req }) =>
      isAppUser({ req }) ? { id: { equals: req.user?.id } } : false,
    update: ({ req }) =>
      isAppUser({ req }) ? { id: { equals: req.user?.id } } : false,
    delete: ({ req }) =>
      isAppUser({ req }) ? { id: { equals: req.user?.id } } : false,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "nickname", type: "text" },
    { name: "avatar", type: "upload", relationTo: "media" },
    {
      name: "preferredDistricts",
      type: "select",
      hasMany: true,
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
  ],
}
