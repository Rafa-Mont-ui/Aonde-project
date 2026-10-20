import type { CollectionConfig } from 'payload'
import { createFolderField, createTagField } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { revalidateSite } from '../lib/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  // Museum covers and galleries are baked into the static pages.
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
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: true,
}
