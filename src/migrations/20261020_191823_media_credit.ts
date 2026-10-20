import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "media" ADD COLUMN "credit_url" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_credit" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_credit_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "media" DROP COLUMN "credit_url";
  ALTER TABLE "_media_v" DROP COLUMN "version_credit";
  ALTER TABLE "_media_v" DROP COLUMN "version_credit_url";`)
}
