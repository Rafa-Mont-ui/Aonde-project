import type { Access, CollectionConfig, Where } from "payload"

const readReviews: Access = ({ req }) => {
  if (req.user?.collection === "admins") return true
  const approved: Where = { status: { equals: "approved" } }
  if (req.user?.collection !== "users") return approved
  const own: Where = { owner: { equals: req.user.id } }
  return { or: [approved, own] }
}

// Admins moderate every review; app users only manage their own.
const ownedOrAdmin: Access = ({ req }) => {
  if (req.user?.collection === "admins") return true
  return req.user?.collection === "users"
    ? { owner: { equals: req.user.id } }
    : false
}

export const Reviews: CollectionConfig = {
  slug: "reviews",
  access: {
    create: ({ req }) => req.user?.collection === "users",
    read: readReviews,
    update: ownedOrAdmin,
    delete: ownedOrAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) =>
        operation === "create" && req.user?.collection === "users"
          ? { ...data, owner: req.user.id, status: "pending" }
          : data,
    ],
  },
  fields: [
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
      access: { update: () => false },
    },
    {
      name: "museum",
      type: "relationship",
      relationTo: "museums",
      required: true,
      index: true,
    },
    {
      name: "ratings",
      type: "group",
      fields: [
        { name: "collection", type: "number", required: true, min: 1, max: 5 },
        { name: "accessibility", type: "number", required: true, min: 1, max: 5 },
        { name: "structure", type: "number", required: true, min: 1, max: 5 },
        { name: "service", type: "number", required: true, min: 1, max: 5 },
      ],
    },
    { name: "comment", type: "textarea" },
    { name: "visitDate", type: "date" },
    {
      name: "tags",
      type: "select",
      hasMany: true,
      options: [
        "Ótimo acervo",
        "Boa estrutura",
        "Visita tranquila",
        "Boa acessibilidade",
        "Ideal para crianças",
        "Entrada gratuita",
      ],
    },
    {
      name: "photos",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: ["pending", "approved", "rejected"],
      access: {
        create: () => false,
        update: ({ req }) => req.user?.collection === "admins",
      },
    },
  ],
}
