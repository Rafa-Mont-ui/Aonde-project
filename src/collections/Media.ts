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
    // Free licenses (e.g. CC BY-SA from Wikimedia Commons) require credit;
    // the app shows it under the photo.
    {
      name: 'credit',
      type: 'text',
      label: 'Crédito da foto',
      admin: {
        description:
          'Ex.: “Foto: Nome do autor / Wikimedia Commons, CC BY-SA 4.0”. Obrigatório para fotos com licença que exige atribuição.',
      },
    },
    {
      name: 'creditUrl',
      type: 'text',
      label: 'Link do crédito',
      admin: {
        description: 'Página de origem da foto (com autor e licença).',
      },
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: true,
}
