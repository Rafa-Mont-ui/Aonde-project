import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
