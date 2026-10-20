import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_users_preferred_districts" AS ENUM('Matriz', 'Boa Vista', 'Santa Felicidade', 'Cajuru', 'Portão', 'CIC', 'Boqueirão', 'Pinheirinho', 'Bairro Novo', 'Tatuquara');
  CREATE TYPE "public"."enum__users_v_version_preferred_districts" AS ENUM('Matriz', 'Boa Vista', 'Santa Felicidade', 'Cajuru', 'Portão', 'CIC', 'Boqueirão', 'Pinheirinho', 'Bairro Novo', 'Tatuquara');
  CREATE TYPE "public"."enum_museums_accessibility_features" AS ENUM('rampa', 'elevador', 'banheiro', 'vaga-pcd', 'libras', 'audiodescricao', 'piso-tatil', 'recursos-tateis', 'cadeira-de-rodas');
  CREATE TYPE "public"."enum_museums_type" AS ENUM('Arte', 'História', 'Ciência', 'Memória', 'Outros');
  CREATE TYPE "public"."enum_museums_district" AS ENUM('Matriz', 'Boa Vista', 'Santa Felicidade', 'Cajuru', 'Portão', 'CIC', 'Boqueirão', 'Pinheirinho', 'Bairro Novo', 'Tatuquara');
  CREATE TYPE "public"."enum_museums_open_status" AS ENUM('schedule', 'closed');
  CREATE TYPE "public"."enum__museums_v_version_accessibility_features" AS ENUM('rampa', 'elevador', 'banheiro', 'vaga-pcd', 'libras', 'audiodescricao', 'piso-tatil', 'recursos-tateis', 'cadeira-de-rodas');
  CREATE TYPE "public"."enum__museums_v_version_type" AS ENUM('Arte', 'História', 'Ciência', 'Memória', 'Outros');
  CREATE TYPE "public"."enum__museums_v_version_district" AS ENUM('Matriz', 'Boa Vista', 'Santa Felicidade', 'Cajuru', 'Portão', 'CIC', 'Boqueirão', 'Pinheirinho', 'Bairro Novo', 'Tatuquara');
  CREATE TYPE "public"."enum__museums_v_version_open_status" AS ENUM('schedule', 'closed');
  CREATE TYPE "public"."enum_reviews_tags" AS ENUM('Ótimo acervo', 'Boa estrutura', 'Visita tranquila', 'Boa acessibilidade', 'Ideal para crianças', 'Entrada gratuita');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum__reviews_v_version_tags" AS ENUM('Ótimo acervo', 'Boa estrutura', 'Visita tranquila', 'Boa acessibilidade', 'Ideal para crianças', 'Entrada gratuita');
  CREATE TYPE "public"."enum__reviews_v_version_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_payload_llm_instructions_entity_type" AS ENUM('collection', 'global');
  CREATE TABLE "admins_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "admins" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "admins_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_admins_v_version_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "_admins_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_email" varchar NOT NULL,
  	"version_reset_password_token" varchar,
  	"version_reset_password_expiration" timestamp(3) with time zone,
  	"version_salt" varchar,
  	"version_hash" varchar,
  	"version_reset_password_requested_at" timestamp(3) with time zone,
  	"version_login_attempts" numeric DEFAULT 0,
  	"version_lock_until" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_admins_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "media" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"alt" varchar NOT NULL,
  	"_h_folders_id" uuid,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"original_filename" varchar,
  	"original_url" varchar,
  	"original_mime_type" varchar,
  	"original_filesize" numeric,
  	"original_width" numeric,
  	"original_height" numeric,
  	"original_prefix" varchar,
  	"original__objectkey" varchar,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" uuid,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_media_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_alt" varchar NOT NULL,
  	"version__h_folders_id" uuid,
  	"version_prefix" varchar DEFAULT '',
  	"version__objectkey" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_original_filename" varchar,
  	"version_original_url" varchar,
  	"version_original_mime_type" varchar,
  	"version_original_filesize" numeric,
  	"version_original_width" numeric,
  	"version_original_height" numeric,
  	"version_original_prefix" varchar,
  	"version_original__objectkey" varchar,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_media_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" uuid,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "folders" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_h_folders_id" uuid,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "folders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_folders_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version__h_folders_id" uuid,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_folders_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "tags" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_h_tags_id" uuid,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_tags_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version__h_tags_id" uuid,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_tags_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "posts" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_posts_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar NOT NULL,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "users_preferred_districts" (
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"value" "enum_users_preferred_districts",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"nickname" varchar,
  	"avatar_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_users_v_version_preferred_districts" (
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"value" "enum__users_v_version_preferred_districts",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  CREATE TABLE "_users_v_version_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "_users_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_name" varchar NOT NULL,
  	"version_nickname" varchar,
  	"version_avatar_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_email" varchar NOT NULL,
  	"version_reset_password_token" varchar,
  	"version_reset_password_expiration" timestamp(3) with time zone,
  	"version_salt" varchar,
  	"version_hash" varchar,
  	"version_reset_password_requested_at" timestamp(3) with time zone,
  	"version_login_attempts" numeric DEFAULT 0,
  	"version_lock_until" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_users_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "museums_accessibility_features" (
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"value" "enum_museums_accessibility_features",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  CREATE TABLE "museums" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_museums_type" NOT NULL,
  	"district" "enum_museums_district" NOT NULL,
  	"description" varchar NOT NULL,
  	"cover_id" uuid NOT NULL,
  	"opening_hours" varchar NOT NULL,
  	"ticket_info" varchar NOT NULL,
  	"exhibition_info" varchar,
  	"address" varchar NOT NULL,
  	"website" varchar,
  	"instagram" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"open_status" "enum_museums_open_status" DEFAULT 'schedule',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "museums_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_museums_v_version_accessibility_features" (
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"value" "enum__museums_v_version_accessibility_features",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  CREATE TABLE "_museums_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_type" "enum__museums_v_version_type" NOT NULL,
  	"version_district" "enum__museums_v_version_district" NOT NULL,
  	"version_description" varchar NOT NULL,
  	"version_cover_id" uuid NOT NULL,
  	"version_opening_hours" varchar NOT NULL,
  	"version_ticket_info" varchar NOT NULL,
  	"version_exhibition_info" varchar,
  	"version_address" varchar NOT NULL,
  	"version_website" varchar,
  	"version_instagram" varchar,
  	"version_latitude" numeric,
  	"version_longitude" numeric,
  	"version_open_status" "enum__museums_v_version_open_status" DEFAULT 'schedule',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_museums_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "favorites" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"owner_id" uuid NOT NULL,
  	"museum_id" uuid NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "favorites_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_favorites_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_owner_id" uuid NOT NULL,
  	"version_museum_id" uuid NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_favorites_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "visits" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"owner_id" uuid NOT NULL,
  	"museum_id" uuid NOT NULL,
  	"visited_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "visits_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_visits_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_owner_id" uuid NOT NULL,
  	"version_museum_id" uuid NOT NULL,
  	"version_visited_at" timestamp(3) with time zone NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_visits_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "reviews_tags" (
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"value" "enum_reviews_tags",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"owner_id" uuid NOT NULL,
  	"museum_id" uuid NOT NULL,
  	"ratings_collection" numeric NOT NULL,
  	"ratings_accessibility" numeric NOT NULL,
  	"ratings_structure" numeric NOT NULL,
  	"ratings_service" numeric NOT NULL,
  	"comment" varchar,
  	"visit_date" timestamp(3) with time zone,
  	"status" "enum_reviews_status" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "_reviews_v_version_tags" (
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"value" "enum__reviews_v_version_tags",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  CREATE TABLE "_reviews_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_owner_id" uuid NOT NULL,
  	"version_museum_id" uuid NOT NULL,
  	"version_ratings_collection" numeric NOT NULL,
  	"version_ratings_accessibility" numeric NOT NULL,
  	"version_ratings_structure" numeric NOT NULL,
  	"version_ratings_service" numeric NOT NULL,
  	"version_comment" varchar,
  	"version_visit_date" timestamp(3) with time zone,
  	"version_status" "enum__reviews_v_version_status" DEFAULT 'pending' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_reviews_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" uuid,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "payload_kv" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"media_id" uuid,
  	"folders_id" uuid,
  	"tags_id" uuid,
  	"posts_id" uuid,
  	"users_id" uuid,
  	"museums_id" uuid,
  	"favorites_id" uuid,
  	"visits_id" uuid,
  	"reviews_id" uuid
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"entity_slug" varchar NOT NULL,
  	"entity_type" "enum_payload_llm_instructions_entity_type" NOT NULL,
  	"additional_instructions" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid,
  	"users_id" uuid
  );
  
  ALTER TABLE "admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_admins_v_version_sessions" ADD CONSTRAINT "_admins_v_version_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_admins_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_admins_v" ADD CONSTRAINT "_admins_v_parent_id_admins_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_admins_v_rels" ADD CONSTRAINT "_admins_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_admins_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_admins_v_rels" ADD CONSTRAINT "_admins_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_admins_v_rels" ADD CONSTRAINT "_admins_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_media_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders" ADD CONSTRAINT "folders__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_parent_id_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_folders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags__h_tags_id_tags_id_fk" FOREIGN KEY ("_h_tags_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_version__h_tags_id_tags_id_fk" FOREIGN KEY ("version__h_tags_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_preferred_districts" ADD CONSTRAINT "users_preferred_districts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_version_preferred_districts" ADD CONSTRAINT "_users_v_version_preferred_districts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_version_sessions" ADD CONSTRAINT "_users_v_version_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v" ADD CONSTRAINT "_users_v_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_users_v" ADD CONSTRAINT "_users_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_users_v_rels" ADD CONSTRAINT "_users_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_rels" ADD CONSTRAINT "_users_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_rels" ADD CONSTRAINT "_users_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "museums_accessibility_features" ADD CONSTRAINT "museums_accessibility_features_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."museums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "museums" ADD CONSTRAINT "museums_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "museums_rels" ADD CONSTRAINT "museums_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."museums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "museums_rels" ADD CONSTRAINT "museums_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "museums_rels" ADD CONSTRAINT "museums_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "museums_rels" ADD CONSTRAINT "museums_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_museums_v_version_accessibility_features" ADD CONSTRAINT "_museums_v_version_accessibility_features_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_museums_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_museums_v" ADD CONSTRAINT "_museums_v_parent_id_museums_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."museums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_museums_v" ADD CONSTRAINT "_museums_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_museums_v_rels" ADD CONSTRAINT "_museums_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_museums_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_museums_v_rels" ADD CONSTRAINT "_museums_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_museums_v_rels" ADD CONSTRAINT "_museums_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_museums_v_rels" ADD CONSTRAINT "_museums_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "favorites" ADD CONSTRAINT "favorites_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favorites" ADD CONSTRAINT "favorites_museum_id_museums_id_fk" FOREIGN KEY ("museum_id") REFERENCES "public"."museums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favorites_rels" ADD CONSTRAINT "favorites_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."favorites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "favorites_rels" ADD CONSTRAINT "favorites_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "favorites_rels" ADD CONSTRAINT "favorites_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_favorites_v" ADD CONSTRAINT "_favorites_v_parent_id_favorites_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."favorites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favorites_v" ADD CONSTRAINT "_favorites_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favorites_v" ADD CONSTRAINT "_favorites_v_version_museum_id_museums_id_fk" FOREIGN KEY ("version_museum_id") REFERENCES "public"."museums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favorites_v_rels" ADD CONSTRAINT "_favorites_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_favorites_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_favorites_v_rels" ADD CONSTRAINT "_favorites_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_favorites_v_rels" ADD CONSTRAINT "_favorites_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_museum_id_museums_id_fk" FOREIGN KEY ("museum_id") REFERENCES "public"."museums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "visits_rels" ADD CONSTRAINT "visits_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visits_rels" ADD CONSTRAINT "visits_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visits_rels" ADD CONSTRAINT "visits_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_visits_v" ADD CONSTRAINT "_visits_v_parent_id_visits_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."visits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_visits_v" ADD CONSTRAINT "_visits_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_visits_v" ADD CONSTRAINT "_visits_v_version_museum_id_museums_id_fk" FOREIGN KEY ("version_museum_id") REFERENCES "public"."museums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_visits_v_rels" ADD CONSTRAINT "_visits_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_visits_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_visits_v_rels" ADD CONSTRAINT "_visits_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_visits_v_rels" ADD CONSTRAINT "_visits_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_tags" ADD CONSTRAINT "reviews_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_museum_id_museums_id_fk" FOREIGN KEY ("museum_id") REFERENCES "public"."museums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reviews_v_version_tags" ADD CONSTRAINT "_reviews_v_version_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_reviews_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_parent_id_reviews_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_version_museum_id_museums_id_fk" FOREIGN KEY ("version_museum_id") REFERENCES "public"."museums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v_rels" ADD CONSTRAINT "_reviews_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_reviews_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reviews_v_rels" ADD CONSTRAINT "_reviews_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reviews_v_rels" ADD CONSTRAINT "_reviews_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reviews_v_rels" ADD CONSTRAINT "_reviews_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_folders_fk" FOREIGN KEY ("folders_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_museums_fk" FOREIGN KEY ("museums_id") REFERENCES "public"."museums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_favorites_fk" FOREIGN KEY ("favorites_id") REFERENCES "public"."favorites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_visits_fk" FOREIGN KEY ("visits_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_llm_instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_sessions_order_idx" ON "admins_sessions" USING btree ("_order");
  CREATE INDEX "admins_sessions_parent_id_idx" ON "admins_sessions" USING btree ("_parent_id");
  CREATE INDEX "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "admins" USING btree ("created_at");
  CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");
  CREATE INDEX "admins_rels_order_idx" ON "admins_rels" USING btree ("order");
  CREATE INDEX "admins_rels_parent_idx" ON "admins_rels" USING btree ("parent_id");
  CREATE INDEX "admins_rels_path_idx" ON "admins_rels" USING btree ("path");
  CREATE INDEX "admins_rels_admins_id_idx" ON "admins_rels" USING btree ("admins_id");
  CREATE INDEX "admins_rels_users_id_idx" ON "admins_rels" USING btree ("users_id");
  CREATE INDEX "_admins_v_version_sessions_order_idx" ON "_admins_v_version_sessions" USING btree ("_order");
  CREATE INDEX "_admins_v_version_sessions_parent_id_idx" ON "_admins_v_version_sessions" USING btree ("_parent_id");
  CREATE INDEX "_admins_v_parent_idx" ON "_admins_v" USING btree ("parent_id");
  CREATE INDEX "_admins_v_version_version_updated_at_idx" ON "_admins_v" USING btree ("version_updated_at");
  CREATE INDEX "_admins_v_version_version_created_at_idx" ON "_admins_v" USING btree ("version_created_at");
  CREATE INDEX "_admins_v_version_version_email_idx" ON "_admins_v" USING btree ("version_email");
  CREATE INDEX "_admins_v_created_at_idx" ON "_admins_v" USING btree ("created_at");
  CREATE INDEX "_admins_v_updated_at_idx" ON "_admins_v" USING btree ("updated_at");
  CREATE INDEX "_admins_v_rels_order_idx" ON "_admins_v_rels" USING btree ("order");
  CREATE INDEX "_admins_v_rels_parent_idx" ON "_admins_v_rels" USING btree ("parent_id");
  CREATE INDEX "_admins_v_rels_path_idx" ON "_admins_v_rels" USING btree ("path");
  CREATE INDEX "_admins_v_rels_admins_id_idx" ON "_admins_v_rels" USING btree ("admins_id");
  CREATE INDEX "_admins_v_rels_users_id_idx" ON "_admins_v_rels" USING btree ("users_id");
  CREATE INDEX "media__h_folders_idx" ON "media" USING btree ("_h_folders_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_original_original_filename_idx" ON "media" USING btree ("original_filename");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_tags_id_idx" ON "media_rels" USING btree ("tags_id");
  CREATE INDEX "media_rels_admins_id_idx" ON "media_rels" USING btree ("admins_id");
  CREATE INDEX "media_rels_users_id_idx" ON "media_rels" USING btree ("users_id");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version__h_folders_idx" ON "_media_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_original_version_original_filename_idx" ON "_media_v" USING btree ("version_original_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "_media_v_rels_order_idx" ON "_media_v_rels" USING btree ("order");
  CREATE INDEX "_media_v_rels_parent_idx" ON "_media_v_rels" USING btree ("parent_id");
  CREATE INDEX "_media_v_rels_path_idx" ON "_media_v_rels" USING btree ("path");
  CREATE INDEX "_media_v_rels_tags_id_idx" ON "_media_v_rels" USING btree ("tags_id");
  CREATE INDEX "_media_v_rels_admins_id_idx" ON "_media_v_rels" USING btree ("admins_id");
  CREATE INDEX "_media_v_rels_users_id_idx" ON "_media_v_rels" USING btree ("users_id");
  CREATE INDEX "folders__h_folders_idx" ON "folders" USING btree ("_h_folders_id");
  CREATE INDEX "folders_updated_at_idx" ON "folders" USING btree ("updated_at");
  CREATE INDEX "folders_created_at_idx" ON "folders" USING btree ("created_at");
  CREATE INDEX "folders_rels_order_idx" ON "folders_rels" USING btree ("order");
  CREATE INDEX "folders_rels_parent_idx" ON "folders_rels" USING btree ("parent_id");
  CREATE INDEX "folders_rels_path_idx" ON "folders_rels" USING btree ("path");
  CREATE INDEX "folders_rels_admins_id_idx" ON "folders_rels" USING btree ("admins_id");
  CREATE INDEX "folders_rels_users_id_idx" ON "folders_rels" USING btree ("users_id");
  CREATE INDEX "_folders_v_parent_idx" ON "_folders_v" USING btree ("parent_id");
  CREATE INDEX "_folders_v_version_version__h_folders_idx" ON "_folders_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_folders_v_version_version_updated_at_idx" ON "_folders_v" USING btree ("version_updated_at");
  CREATE INDEX "_folders_v_version_version_created_at_idx" ON "_folders_v" USING btree ("version_created_at");
  CREATE INDEX "_folders_v_created_at_idx" ON "_folders_v" USING btree ("created_at");
  CREATE INDEX "_folders_v_updated_at_idx" ON "_folders_v" USING btree ("updated_at");
  CREATE INDEX "_folders_v_rels_order_idx" ON "_folders_v_rels" USING btree ("order");
  CREATE INDEX "_folders_v_rels_parent_idx" ON "_folders_v_rels" USING btree ("parent_id");
  CREATE INDEX "_folders_v_rels_path_idx" ON "_folders_v_rels" USING btree ("path");
  CREATE INDEX "_folders_v_rels_admins_id_idx" ON "_folders_v_rels" USING btree ("admins_id");
  CREATE INDEX "_folders_v_rels_users_id_idx" ON "_folders_v_rels" USING btree ("users_id");
  CREATE INDEX "tags__h_tags_idx" ON "tags" USING btree ("_h_tags_id");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "tags_rels_order_idx" ON "tags_rels" USING btree ("order");
  CREATE INDEX "tags_rels_parent_idx" ON "tags_rels" USING btree ("parent_id");
  CREATE INDEX "tags_rels_path_idx" ON "tags_rels" USING btree ("path");
  CREATE INDEX "tags_rels_admins_id_idx" ON "tags_rels" USING btree ("admins_id");
  CREATE INDEX "tags_rels_users_id_idx" ON "tags_rels" USING btree ("users_id");
  CREATE INDEX "_tags_v_parent_idx" ON "_tags_v" USING btree ("parent_id");
  CREATE INDEX "_tags_v_version_version__h_tags_idx" ON "_tags_v" USING btree ("version__h_tags_id");
  CREATE INDEX "_tags_v_version_version_updated_at_idx" ON "_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_tags_v_version_version_created_at_idx" ON "_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_tags_v_created_at_idx" ON "_tags_v" USING btree ("created_at");
  CREATE INDEX "_tags_v_updated_at_idx" ON "_tags_v" USING btree ("updated_at");
  CREATE INDEX "_tags_v_rels_order_idx" ON "_tags_v_rels" USING btree ("order");
  CREATE INDEX "_tags_v_rels_parent_idx" ON "_tags_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tags_v_rels_path_idx" ON "_tags_v_rels" USING btree ("path");
  CREATE INDEX "_tags_v_rels_admins_id_idx" ON "_tags_v_rels" USING btree ("admins_id");
  CREATE INDEX "_tags_v_rels_users_id_idx" ON "_tags_v_rels" USING btree ("users_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_admins_id_idx" ON "posts_rels" USING btree ("admins_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_admins_id_idx" ON "_posts_v_rels" USING btree ("admins_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "users_preferred_districts_order_idx" ON "users_preferred_districts" USING btree ("order");
  CREATE INDEX "users_preferred_districts_parent_idx" ON "users_preferred_districts" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_admins_id_idx" ON "users_rels" USING btree ("admins_id");
  CREATE INDEX "users_rels_users_id_idx" ON "users_rels" USING btree ("users_id");
  CREATE INDEX "_users_v_version_preferred_districts_order_idx" ON "_users_v_version_preferred_districts" USING btree ("order");
  CREATE INDEX "_users_v_version_preferred_districts_parent_idx" ON "_users_v_version_preferred_districts" USING btree ("parent_id");
  CREATE INDEX "_users_v_version_sessions_order_idx" ON "_users_v_version_sessions" USING btree ("_order");
  CREATE INDEX "_users_v_version_sessions_parent_id_idx" ON "_users_v_version_sessions" USING btree ("_parent_id");
  CREATE INDEX "_users_v_parent_idx" ON "_users_v" USING btree ("parent_id");
  CREATE INDEX "_users_v_version_version_avatar_idx" ON "_users_v" USING btree ("version_avatar_id");
  CREATE INDEX "_users_v_version_version_updated_at_idx" ON "_users_v" USING btree ("version_updated_at");
  CREATE INDEX "_users_v_version_version_created_at_idx" ON "_users_v" USING btree ("version_created_at");
  CREATE INDEX "_users_v_version_version_email_idx" ON "_users_v" USING btree ("version_email");
  CREATE INDEX "_users_v_created_at_idx" ON "_users_v" USING btree ("created_at");
  CREATE INDEX "_users_v_updated_at_idx" ON "_users_v" USING btree ("updated_at");
  CREATE INDEX "_users_v_rels_order_idx" ON "_users_v_rels" USING btree ("order");
  CREATE INDEX "_users_v_rels_parent_idx" ON "_users_v_rels" USING btree ("parent_id");
  CREATE INDEX "_users_v_rels_path_idx" ON "_users_v_rels" USING btree ("path");
  CREATE INDEX "_users_v_rels_admins_id_idx" ON "_users_v_rels" USING btree ("admins_id");
  CREATE INDEX "_users_v_rels_users_id_idx" ON "_users_v_rels" USING btree ("users_id");
  CREATE INDEX "museums_accessibility_features_order_idx" ON "museums_accessibility_features" USING btree ("order");
  CREATE INDEX "museums_accessibility_features_parent_idx" ON "museums_accessibility_features" USING btree ("parent_id");
  CREATE UNIQUE INDEX "museums_slug_idx" ON "museums" USING btree ("slug");
  CREATE INDEX "museums_cover_idx" ON "museums" USING btree ("cover_id");
  CREATE INDEX "museums_updated_at_idx" ON "museums" USING btree ("updated_at");
  CREATE INDEX "museums_created_at_idx" ON "museums" USING btree ("created_at");
  CREATE INDEX "museums_rels_order_idx" ON "museums_rels" USING btree ("order");
  CREATE INDEX "museums_rels_parent_idx" ON "museums_rels" USING btree ("parent_id");
  CREATE INDEX "museums_rels_path_idx" ON "museums_rels" USING btree ("path");
  CREATE INDEX "museums_rels_media_id_idx" ON "museums_rels" USING btree ("media_id");
  CREATE INDEX "museums_rels_admins_id_idx" ON "museums_rels" USING btree ("admins_id");
  CREATE INDEX "museums_rels_users_id_idx" ON "museums_rels" USING btree ("users_id");
  CREATE INDEX "_museums_v_version_accessibility_features_order_idx" ON "_museums_v_version_accessibility_features" USING btree ("order");
  CREATE INDEX "_museums_v_version_accessibility_features_parent_idx" ON "_museums_v_version_accessibility_features" USING btree ("parent_id");
  CREATE INDEX "_museums_v_parent_idx" ON "_museums_v" USING btree ("parent_id");
  CREATE INDEX "_museums_v_version_version_slug_idx" ON "_museums_v" USING btree ("version_slug");
  CREATE INDEX "_museums_v_version_version_cover_idx" ON "_museums_v" USING btree ("version_cover_id");
  CREATE INDEX "_museums_v_version_version_updated_at_idx" ON "_museums_v" USING btree ("version_updated_at");
  CREATE INDEX "_museums_v_version_version_created_at_idx" ON "_museums_v" USING btree ("version_created_at");
  CREATE INDEX "_museums_v_created_at_idx" ON "_museums_v" USING btree ("created_at");
  CREATE INDEX "_museums_v_updated_at_idx" ON "_museums_v" USING btree ("updated_at");
  CREATE INDEX "_museums_v_rels_order_idx" ON "_museums_v_rels" USING btree ("order");
  CREATE INDEX "_museums_v_rels_parent_idx" ON "_museums_v_rels" USING btree ("parent_id");
  CREATE INDEX "_museums_v_rels_path_idx" ON "_museums_v_rels" USING btree ("path");
  CREATE INDEX "_museums_v_rels_media_id_idx" ON "_museums_v_rels" USING btree ("media_id");
  CREATE INDEX "_museums_v_rels_admins_id_idx" ON "_museums_v_rels" USING btree ("admins_id");
  CREATE INDEX "_museums_v_rels_users_id_idx" ON "_museums_v_rels" USING btree ("users_id");
  CREATE INDEX "favorites_owner_idx" ON "favorites" USING btree ("owner_id");
  CREATE INDEX "favorites_museum_idx" ON "favorites" USING btree ("museum_id");
  CREATE INDEX "favorites_updated_at_idx" ON "favorites" USING btree ("updated_at");
  CREATE INDEX "favorites_created_at_idx" ON "favorites" USING btree ("created_at");
  CREATE INDEX "favorites_rels_order_idx" ON "favorites_rels" USING btree ("order");
  CREATE INDEX "favorites_rels_parent_idx" ON "favorites_rels" USING btree ("parent_id");
  CREATE INDEX "favorites_rels_path_idx" ON "favorites_rels" USING btree ("path");
  CREATE INDEX "favorites_rels_admins_id_idx" ON "favorites_rels" USING btree ("admins_id");
  CREATE INDEX "favorites_rels_users_id_idx" ON "favorites_rels" USING btree ("users_id");
  CREATE INDEX "_favorites_v_parent_idx" ON "_favorites_v" USING btree ("parent_id");
  CREATE INDEX "_favorites_v_version_version_owner_idx" ON "_favorites_v" USING btree ("version_owner_id");
  CREATE INDEX "_favorites_v_version_version_museum_idx" ON "_favorites_v" USING btree ("version_museum_id");
  CREATE INDEX "_favorites_v_version_version_updated_at_idx" ON "_favorites_v" USING btree ("version_updated_at");
  CREATE INDEX "_favorites_v_version_version_created_at_idx" ON "_favorites_v" USING btree ("version_created_at");
  CREATE INDEX "_favorites_v_created_at_idx" ON "_favorites_v" USING btree ("created_at");
  CREATE INDEX "_favorites_v_updated_at_idx" ON "_favorites_v" USING btree ("updated_at");
  CREATE INDEX "_favorites_v_rels_order_idx" ON "_favorites_v_rels" USING btree ("order");
  CREATE INDEX "_favorites_v_rels_parent_idx" ON "_favorites_v_rels" USING btree ("parent_id");
  CREATE INDEX "_favorites_v_rels_path_idx" ON "_favorites_v_rels" USING btree ("path");
  CREATE INDEX "_favorites_v_rels_admins_id_idx" ON "_favorites_v_rels" USING btree ("admins_id");
  CREATE INDEX "_favorites_v_rels_users_id_idx" ON "_favorites_v_rels" USING btree ("users_id");
  CREATE INDEX "visits_owner_idx" ON "visits" USING btree ("owner_id");
  CREATE INDEX "visits_museum_idx" ON "visits" USING btree ("museum_id");
  CREATE INDEX "visits_updated_at_idx" ON "visits" USING btree ("updated_at");
  CREATE INDEX "visits_created_at_idx" ON "visits" USING btree ("created_at");
  CREATE INDEX "visits_rels_order_idx" ON "visits_rels" USING btree ("order");
  CREATE INDEX "visits_rels_parent_idx" ON "visits_rels" USING btree ("parent_id");
  CREATE INDEX "visits_rels_path_idx" ON "visits_rels" USING btree ("path");
  CREATE INDEX "visits_rels_admins_id_idx" ON "visits_rels" USING btree ("admins_id");
  CREATE INDEX "visits_rels_users_id_idx" ON "visits_rels" USING btree ("users_id");
  CREATE INDEX "_visits_v_parent_idx" ON "_visits_v" USING btree ("parent_id");
  CREATE INDEX "_visits_v_version_version_owner_idx" ON "_visits_v" USING btree ("version_owner_id");
  CREATE INDEX "_visits_v_version_version_museum_idx" ON "_visits_v" USING btree ("version_museum_id");
  CREATE INDEX "_visits_v_version_version_updated_at_idx" ON "_visits_v" USING btree ("version_updated_at");
  CREATE INDEX "_visits_v_version_version_created_at_idx" ON "_visits_v" USING btree ("version_created_at");
  CREATE INDEX "_visits_v_created_at_idx" ON "_visits_v" USING btree ("created_at");
  CREATE INDEX "_visits_v_updated_at_idx" ON "_visits_v" USING btree ("updated_at");
  CREATE INDEX "_visits_v_rels_order_idx" ON "_visits_v_rels" USING btree ("order");
  CREATE INDEX "_visits_v_rels_parent_idx" ON "_visits_v_rels" USING btree ("parent_id");
  CREATE INDEX "_visits_v_rels_path_idx" ON "_visits_v_rels" USING btree ("path");
  CREATE INDEX "_visits_v_rels_admins_id_idx" ON "_visits_v_rels" USING btree ("admins_id");
  CREATE INDEX "_visits_v_rels_users_id_idx" ON "_visits_v_rels" USING btree ("users_id");
  CREATE INDEX "reviews_tags_order_idx" ON "reviews_tags" USING btree ("order");
  CREATE INDEX "reviews_tags_parent_idx" ON "reviews_tags" USING btree ("parent_id");
  CREATE INDEX "reviews_owner_idx" ON "reviews" USING btree ("owner_id");
  CREATE INDEX "reviews_museum_idx" ON "reviews" USING btree ("museum_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
  CREATE INDEX "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
  CREATE INDEX "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
  CREATE INDEX "reviews_rels_media_id_idx" ON "reviews_rels" USING btree ("media_id");
  CREATE INDEX "reviews_rels_admins_id_idx" ON "reviews_rels" USING btree ("admins_id");
  CREATE INDEX "reviews_rels_users_id_idx" ON "reviews_rels" USING btree ("users_id");
  CREATE INDEX "_reviews_v_version_tags_order_idx" ON "_reviews_v_version_tags" USING btree ("order");
  CREATE INDEX "_reviews_v_version_tags_parent_idx" ON "_reviews_v_version_tags" USING btree ("parent_id");
  CREATE INDEX "_reviews_v_parent_idx" ON "_reviews_v" USING btree ("parent_id");
  CREATE INDEX "_reviews_v_version_version_owner_idx" ON "_reviews_v" USING btree ("version_owner_id");
  CREATE INDEX "_reviews_v_version_version_museum_idx" ON "_reviews_v" USING btree ("version_museum_id");
  CREATE INDEX "_reviews_v_version_version_updated_at_idx" ON "_reviews_v" USING btree ("version_updated_at");
  CREATE INDEX "_reviews_v_version_version_created_at_idx" ON "_reviews_v" USING btree ("version_created_at");
  CREATE INDEX "_reviews_v_created_at_idx" ON "_reviews_v" USING btree ("created_at");
  CREATE INDEX "_reviews_v_updated_at_idx" ON "_reviews_v" USING btree ("updated_at");
  CREATE INDEX "_reviews_v_rels_order_idx" ON "_reviews_v_rels" USING btree ("order");
  CREATE INDEX "_reviews_v_rels_parent_idx" ON "_reviews_v_rels" USING btree ("parent_id");
  CREATE INDEX "_reviews_v_rels_path_idx" ON "_reviews_v_rels" USING btree ("path");
  CREATE INDEX "_reviews_v_rels_media_id_idx" ON "_reviews_v_rels" USING btree ("media_id");
  CREATE INDEX "_reviews_v_rels_admins_id_idx" ON "_reviews_v_rels" USING btree ("admins_id");
  CREATE INDEX "_reviews_v_rels_users_id_idx" ON "_reviews_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("folders_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_museums_id_idx" ON "payload_locked_documents_rels" USING btree ("museums_id");
  CREATE INDEX "payload_locked_documents_rels_favorites_id_idx" ON "payload_locked_documents_rels" USING btree ("favorites_id");
  CREATE INDEX "payload_locked_documents_rels_visits_id_idx" ON "payload_locked_documents_rels" USING btree ("visits_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admins_id_idx" ON "payload_preferences_rels" USING btree ("admins_id");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_entity_slug_idx" ON "payload_llm_instructions" USING btree ("entity_slug");
  CREATE INDEX "payload_llm_instructions_updated_at_idx" ON "payload_llm_instructions" USING btree ("updated_at");
  CREATE INDEX "payload_llm_instructions_created_at_idx" ON "payload_llm_instructions" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_rels_order_idx" ON "payload_llm_instructions_rels" USING btree ("order");
  CREATE INDEX "payload_llm_instructions_rels_parent_idx" ON "payload_llm_instructions_rels" USING btree ("parent_id");
  CREATE INDEX "payload_llm_instructions_rels_path_idx" ON "payload_llm_instructions_rels" USING btree ("path");
  CREATE INDEX "payload_llm_instructions_rels_admins_id_idx" ON "payload_llm_instructions_rels" USING btree ("admins_id");
  CREATE INDEX "payload_llm_instructions_rels_users_id_idx" ON "payload_llm_instructions_rels" USING btree ("users_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admins_sessions" CASCADE;
  DROP TABLE "admins" CASCADE;
  DROP TABLE "admins_rels" CASCADE;
  DROP TABLE "_admins_v_version_sessions" CASCADE;
  DROP TABLE "_admins_v" CASCADE;
  DROP TABLE "_admins_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "_media_v_rels" CASCADE;
  DROP TABLE "folders" CASCADE;
  DROP TABLE "folders_rels" CASCADE;
  DROP TABLE "_folders_v" CASCADE;
  DROP TABLE "_folders_v_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "tags_rels" CASCADE;
  DROP TABLE "_tags_v" CASCADE;
  DROP TABLE "_tags_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "users_preferred_districts" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "_users_v_version_preferred_districts" CASCADE;
  DROP TABLE "_users_v_version_sessions" CASCADE;
  DROP TABLE "_users_v" CASCADE;
  DROP TABLE "_users_v_rels" CASCADE;
  DROP TABLE "museums_accessibility_features" CASCADE;
  DROP TABLE "museums" CASCADE;
  DROP TABLE "museums_rels" CASCADE;
  DROP TABLE "_museums_v_version_accessibility_features" CASCADE;
  DROP TABLE "_museums_v" CASCADE;
  DROP TABLE "_museums_v_rels" CASCADE;
  DROP TABLE "favorites" CASCADE;
  DROP TABLE "favorites_rels" CASCADE;
  DROP TABLE "_favorites_v" CASCADE;
  DROP TABLE "_favorites_v_rels" CASCADE;
  DROP TABLE "visits" CASCADE;
  DROP TABLE "visits_rels" CASCADE;
  DROP TABLE "_visits_v" CASCADE;
  DROP TABLE "_visits_v_rels" CASCADE;
  DROP TABLE "reviews_tags" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_rels" CASCADE;
  DROP TABLE "_reviews_v_version_tags" CASCADE;
  DROP TABLE "_reviews_v" CASCADE;
  DROP TABLE "_reviews_v_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "payload_llm_instructions" CASCADE;
  DROP TABLE "payload_llm_instructions_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_preferred_districts";
  DROP TYPE "public"."enum__users_v_version_preferred_districts";
  DROP TYPE "public"."enum_museums_accessibility_features";
  DROP TYPE "public"."enum_museums_type";
  DROP TYPE "public"."enum_museums_district";
  DROP TYPE "public"."enum_museums_open_status";
  DROP TYPE "public"."enum__museums_v_version_accessibility_features";
  DROP TYPE "public"."enum__museums_v_version_type";
  DROP TYPE "public"."enum__museums_v_version_district";
  DROP TYPE "public"."enum__museums_v_version_open_status";
  DROP TYPE "public"."enum_reviews_tags";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum__reviews_v_version_tags";
  DROP TYPE "public"."enum__reviews_v_version_status";
  DROP TYPE "public"."enum_payload_llm_instructions_entity_type";`)
}
