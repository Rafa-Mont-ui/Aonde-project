import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Tags: CollectionConfig = {
  slug: 'tags',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
  },
  tags: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
