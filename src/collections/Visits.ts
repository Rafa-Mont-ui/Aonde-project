import type { Access, CollectionConfig } from "payload"

const owned: Access = ({ req }) =>
  req.user?.collection === "users"
    ? { owner: { equals: req.user.id } }
    : false

export const Visits: CollectionConfig = {
  slug: "visits",
  admin: { hidden: true },
  access: {
    create: ({ req }) => req.user?.collection === "users",
    read: owned,
    update: owned,
    delete: owned,
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) =>
        operation === "create" && req.user?.collection === "users"
          ? { ...data, owner: req.user.id }
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
    { name: "visitedAt", type: "date", required: true },
  ],
}
