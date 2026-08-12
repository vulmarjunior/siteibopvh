-- Migração aditiva da Central Administrativa para o banco oficial.
-- Não remove, recria ou esvazia tabelas existentes.

BEGIN;

CREATE TYPE "SiteModuleStatus" AS ENUM ('DRAFT','SCHEDULED','ACTIVE','ENDED','ARCHIVED');
CREATE TYPE "SiteDirectAccessPolicy" AS ENUM ('AVAILABLE','CLOSING_PAGE','UNAVAILABLE');
CREATE TYPE "EditorialSeriesStatus" AS ENUM ('DRAFT','SCHEDULED','PUBLISHED','ENDED','ARCHIVED');
CREATE TYPE "EditorialMessageStatus" AS ENUM ('DRAFT','SCHEDULED','PUBLISHED','ARCHIVED');
CREATE TYPE "EditorialMediaType" AS ENUM ('VIDEO','AUDIO','IMAGE');
CREATE TYPE "EditorialEmailRunStatus" AS ENUM ('RUNNING','COMPLETED','PARTIAL','FAILED');
CREATE TYPE "EditorialEmailDeliveryStatus" AS ENUM ('PENDING','SENT','FAILED','SKIPPED');

CREATE TABLE "SiteModule" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "path" TEXT NOT NULL UNIQUE,
  "status" "SiteModuleStatus" NOT NULL DEFAULT 'DRAFT',
  "visibleOnHome" BOOLEAN NOT NULL DEFAULT false,
  "visibleInNavigation" BOOLEAN NOT NULL DEFAULT false,
  "directAccess" "SiteDirectAccessPolicy" NOT NULL DEFAULT 'UNAVAILABLE',
  "publicOperationsOpen" BOOLEAN NOT NULL DEFAULT false,
  "permanent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "SiteModule_status_idx" ON "SiteModule"("status");
CREATE INDEX "SiteModule_visibleOnHome_status_idx" ON "SiteModule"("visibleOnHome","status");
CREATE INDEX "SiteModule_visibleInNavigation_status_idx" ON "SiteModule"("visibleInNavigation","status");

CREATE TABLE "SiteEdition" (
  "id" TEXT PRIMARY KEY, "moduleId" TEXT NOT NULL REFERENCES "SiteModule"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "year" INTEGER,
  "status" "SiteModuleStatus" NOT NULL DEFAULT 'DRAFT',
  "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3), "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "SiteEdition_moduleId_slug_key" ON "SiteEdition"("moduleId","slug");
CREATE INDEX "SiteEdition_moduleId_status_idx" ON "SiteEdition"("moduleId","status");
CREATE INDEX "SiteEdition_status_startsAt_endsAt_idx" ON "SiteEdition"("status","startsAt","endsAt");

CREATE TABLE "EditorialSeries" (
  "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL UNIQUE, "title" TEXT NOT NULL,
  "subtitle" TEXT, "description" TEXT,
  "status" "EditorialSeriesStatus" NOT NULL DEFAULT 'DRAFT',
  "startsAt" TIMESTAMPTZ, "endsAt" TIMESTAMPTZ, "publishedAt" TIMESTAMPTZ,
  "defaultThumbnailUrl" TEXT, "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
  "capabilities" JSONB NOT NULL DEFAULT '{}', "customFields" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "EditorialSeries_status_publishedAt_idx" ON "EditorialSeries"("status","publishedAt");
CREATE INDEX "EditorialSeries_startsAt_endsAt_idx" ON "EditorialSeries"("startsAt","endsAt");

CREATE TABLE "EditorialSection" (
  "id" TEXT PRIMARY KEY, "seriesId" TEXT NOT NULL REFERENCES "EditorialSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "EditorialSection_seriesId_slug_key" ON "EditorialSection"("seriesId","slug");
CREATE INDEX "EditorialSection_seriesId_order_idx" ON "EditorialSection"("seriesId","order");

CREATE TABLE "EditorialMessage" (
  "id" TEXT PRIMARY KEY, "seriesId" TEXT NOT NULL REFERENCES "EditorialSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "sectionId" TEXT REFERENCES "EditorialSection"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "slug" TEXT NOT NULL, "order" INTEGER NOT NULL, "title" TEXT NOT NULL, "subtitle" TEXT,
  "scheduledFor" TIMESTAMPTZ NOT NULL, "biblicalText" TEXT NOT NULL, "speaker" TEXT,
  "summary" TEXT, "description" TEXT, "contentHtml" TEXT, "sourceSystem" TEXT,
  "externalId" TEXT, "lastSyncedAt" TIMESTAMPTZ,
  "status" "EditorialMessageStatus" NOT NULL DEFAULT 'DRAFT', "publishedAt" TIMESTAMPTZ,
  "customFields" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "EditorialMessage_seriesId_slug_key" ON "EditorialMessage"("seriesId","slug");
CREATE UNIQUE INDEX "EditorialMessage_seriesId_order_key" ON "EditorialMessage"("seriesId","order");
CREATE UNIQUE INDEX "EditorialMessage_sourceSystem_externalId_key" ON "EditorialMessage"("sourceSystem","externalId");
CREATE INDEX "EditorialMessage_seriesId_status_scheduledFor_idx" ON "EditorialMessage"("seriesId","status","scheduledFor");
CREATE INDEX "EditorialMessage_sectionId_order_idx" ON "EditorialMessage"("sectionId","order");

CREATE TABLE "EditorialMedia" (
  "id" TEXT PRIMARY KEY, "messageId" TEXT NOT NULL REFERENCES "EditorialMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type" "EditorialMediaType" NOT NULL, "title" TEXT, "url" TEXT NOT NULL, "provider" TEXT,
  "externalId" TEXT, "thumbnailUrl" TEXT, "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "EditorialMedia_messageId_type_order_idx" ON "EditorialMedia"("messageId","type","order");

CREATE TABLE "EditorialMaterial" (
  "id" TEXT PRIMARY KEY, "messageId" TEXT NOT NULL REFERENCES "EditorialMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT NOT NULL, "type" TEXT NOT NULL, "url" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "EditorialMaterial_messageId_order_idx" ON "EditorialMaterial"("messageId","order");

CREATE TABLE "EditorialReadingPlan" (
  "id" TEXT PRIMARY KEY, "messageId" TEXT NOT NULL UNIQUE REFERENCES "EditorialMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "theme" TEXT NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "EditorialReadingDay" (
  "id" TEXT PRIMARY KEY, "planId" TEXT NOT NULL REFERENCES "EditorialReadingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "order" INTEGER NOT NULL, "dayLabel" TEXT NOT NULL, "biblicalText" TEXT NOT NULL, "description" TEXT
);
CREATE UNIQUE INDEX "EditorialReadingDay_planId_order_key" ON "EditorialReadingDay"("planId","order");
CREATE INDEX "EditorialReadingDay_planId_order_idx" ON "EditorialReadingDay"("planId","order");

CREATE TABLE "EditorialEmailRun" (
  "id" TEXT PRIMARY KEY, "seriesId" TEXT NOT NULL REFERENCES "EditorialSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "messageId" TEXT NOT NULL REFERENCES "EditorialMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "weekStart" TIMESTAMP(3) NOT NULL, "status" "EditorialEmailRunStatus" NOT NULL DEFAULT 'RUNNING',
  "recipientCount" INTEGER NOT NULL DEFAULT 0, "sentCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3), "error" TEXT
);
CREATE UNIQUE INDEX "EditorialEmailRun_seriesId_messageId_weekStart_key" ON "EditorialEmailRun"("seriesId","messageId","weekStart");
CREATE INDEX "EditorialEmailRun_seriesId_startedAt_idx" ON "EditorialEmailRun"("seriesId","startedAt");
CREATE INDEX "EditorialEmailRun_messageId_idx" ON "EditorialEmailRun"("messageId");

CREATE TABLE "EditorialEmailDelivery" (
  "id" TEXT PRIMARY KEY, "runId" TEXT NOT NULL REFERENCES "EditorialEmailRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "subscriberId" INTEGER NOT NULL REFERENCES "ReadingSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "status" "EditorialEmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "providerId" TEXT, "error" TEXT, "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "EditorialEmailDelivery_runId_subscriberId_key" ON "EditorialEmailDelivery"("runId","subscriberId");
CREATE INDEX "EditorialEmailDelivery_subscriberId_createdAt_idx" ON "EditorialEmailDelivery"("subscriberId","createdAt");
CREATE INDEX "EditorialEmailDelivery_runId_status_idx" ON "EditorialEmailDelivery"("runId","status");

ALTER TABLE "SiteModule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteEdition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialSeries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialSection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialMedia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialMaterial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialReadingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialReadingDay" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialEmailRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialEmailDelivery" ENABLE ROW LEVEL SECURITY;

INSERT INTO "SiteModule" ("id","name","path","status","visibleOnHome","visibleInNavigation","directAccess","publicOperationsOpen","permanent") VALUES
('parousia','Da Ascensão à Parousia','/da-ascensao-a-parousia','ACTIVE',true,false,'AVAILABLE',true,false),
('veredas','Veredas IBO','/veredas','ACTIVE',false,false,'AVAILABLE',true,true),
('relogio','Relógio de Oração','/relogio','ACTIVE',false,true,'AVAILABLE',true,true),
('pascoa','Páscoa e Tenebras','/pascoa','ARCHIVED',false,false,'CLOSING_PAGE',false,false),
('moldanos','Molda-nos','/moldanos','ARCHIVED',false,false,'CLOSING_PAGE',false,false),
('ebf','EBF','/ebf','ENDED',false,false,'CLOSING_PAGE',false,false);

INSERT INTO "SiteEdition" ("id","moduleId","slug","name","year","status","metadata")
VALUES ('ebf-2026','ebf','2026','EBF 2026 — Em Busca do Maior Tesouro',2026,'ENDED','{"historical":true}'::jsonb);

ALTER TABLE "EbfRegistration" ADD COLUMN "editionId" TEXT;
UPDATE "EbfRegistration" SET "editionId"='ebf-2026' WHERE "editionId" IS NULL;
ALTER TABLE "EbfRegistration" ALTER COLUMN "editionId" SET NOT NULL;
ALTER TABLE "EbfRegistration" ADD CONSTRAINT "EbfRegistration_editionId_fkey"
  FOREIGN KEY ("editionId") REFERENCES "SiteEdition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "EbfRegistration_editionId_createdAt_idx" ON "EbfRegistration"("editionId","createdAt");

COMMIT;
