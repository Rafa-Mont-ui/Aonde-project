import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { pt as adminLanguage } from '@payloadcms/translations/languages/pt'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Museums } from './collections/Museums'
import { Favorites } from './collections/Favorites'
import { Visits } from './collections/Visits'
import { Reviews } from './collections/Reviews'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET is missing. Copy .env.example to .env and set it.')
}

// Production (Vercel) uses Postgres from the Neon integration; local
// development can keep using a SQLite file. Migrations in src/migrations are
// Postgres-only — SQLite pushes its schema automatically in development.
const databaseUrl = process.env.DATABASE_URL || 'file:./aonde.db'
const usePostgres = /^postgres(ql)?:\/\//.test(databaseUrl)

export default buildConfig({
  admin: {
    user: Admins.slug,
    autoRefresh: true,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'pt',
    supportedLanguages: { 'pt': adminLanguage },
  },
  collections: [
    Admins,
    Media,
    Folders,
    Tags,
    Posts,
    Users,
    Museums,
    Favorites,
    Visits,
    Reviews,
  ],
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // String (UUID) IDs on both databases; the app relies on string IDs.
  db: usePostgres
    ? postgresAdapter({
        idType: 'uuid',
        pool: { connectionString: databaseUrl },
        migrationDir: path.resolve(dirname, 'migrations'),
      })
    : sqliteAdapter({
        idType: 'uuid',
        client: { url: databaseUrl },
        // Kept apart so Postgres migrations never run against SQLite.
        migrationDir: path.resolve(dirname, 'migrations-sqlite'),
      }),
  // Uploads go to Vercel Blob when its token is set (on Vercel); without it
  // they stay in the local media/ folder.
  storage: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  plugins: [mcpPlugin({})],
})
