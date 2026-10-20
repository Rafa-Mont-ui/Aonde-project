import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Folders: CollectionConfig = {
  slug: 'folders',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
  },
  folders: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
