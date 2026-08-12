CREATE TYPE "EditorialSeriesStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ENDED', 'ARCHIVED');
CREATE TYPE "EditorialMessageStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "EditorialMediaType" AS ENUM ('VIDEO', 'AUDIO', 'IMAGE');

CREATE TABLE "EditorialSeries" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "description" TEXT,
  "status" "EditorialSeriesStatus" NOT NULL DEFAULT 'DRAFT',
  "startsAt" TIMESTAMPTZ,
  "endsAt" TIMESTAMPTZ,
  "publishedAt" TIMESTAMPTZ,
  "defaultThumbnailUrl" TEXT,
  "capabilities" JSONB NOT NULL DEFAULT '{}',
  "customFields" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EditorialSeries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EditorialSection" (
  "id" TEXT NOT NULL,
  "seriesId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EditorialSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EditorialMessage" (
  "id" TEXT NOT NULL,
  "seriesId" TEXT NOT NULL,
  "sectionId" TEXT,
  "slug" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "scheduledFor" TIMESTAMPTZ NOT NULL,
  "biblicalText" TEXT NOT NULL,
  "speaker" TEXT,
  "summary" TEXT,
  "description" TEXT,
  "status" "EditorialMessageStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMPTZ,
  "customFields" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EditorialMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EditorialMedia" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "type" "EditorialMediaType" NOT NULL,
  "title" TEXT,
  "url" TEXT NOT NULL,
  "provider" TEXT,
  "externalId" TEXT,
  "thumbnailUrl" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EditorialMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EditorialMaterial" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EditorialMaterial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EditorialReadingPlan" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "theme" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EditorialReadingPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EditorialReadingDay" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "dayLabel" TEXT NOT NULL,
  "biblicalText" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "EditorialReadingDay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EditorialSeries_slug_key" ON "EditorialSeries"("slug");
CREATE INDEX "EditorialSeries_status_publishedAt_idx" ON "EditorialSeries"("status", "publishedAt");
CREATE INDEX "EditorialSeries_startsAt_endsAt_idx" ON "EditorialSeries"("startsAt", "endsAt");
CREATE UNIQUE INDEX "EditorialSection_seriesId_slug_key" ON "EditorialSection"("seriesId", "slug");
CREATE INDEX "EditorialSection_seriesId_order_idx" ON "EditorialSection"("seriesId", "order");
CREATE UNIQUE INDEX "EditorialMessage_seriesId_slug_key" ON "EditorialMessage"("seriesId", "slug");
CREATE UNIQUE INDEX "EditorialMessage_seriesId_order_key" ON "EditorialMessage"("seriesId", "order");
CREATE INDEX "EditorialMessage_seriesId_status_scheduledFor_idx" ON "EditorialMessage"("seriesId", "status", "scheduledFor");
CREATE INDEX "EditorialMessage_sectionId_order_idx" ON "EditorialMessage"("sectionId", "order");
CREATE INDEX "EditorialMedia_messageId_type_order_idx" ON "EditorialMedia"("messageId", "type", "order");
CREATE INDEX "EditorialMaterial_messageId_order_idx" ON "EditorialMaterial"("messageId", "order");
CREATE UNIQUE INDEX "EditorialReadingPlan_messageId_key" ON "EditorialReadingPlan"("messageId");
CREATE UNIQUE INDEX "EditorialReadingDay_planId_order_key" ON "EditorialReadingDay"("planId", "order");
CREATE INDEX "EditorialReadingDay_planId_order_idx" ON "EditorialReadingDay"("planId", "order");

ALTER TABLE "EditorialSection" ADD CONSTRAINT "EditorialSection_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "EditorialSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialMessage" ADD CONSTRAINT "EditorialMessage_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "EditorialSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialMessage" ADD CONSTRAINT "EditorialMessage_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "EditorialSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EditorialMedia" ADD CONSTRAINT "EditorialMedia_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "EditorialMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialMaterial" ADD CONSTRAINT "EditorialMaterial_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "EditorialMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialReadingPlan" ADD CONSTRAINT "EditorialReadingPlan_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "EditorialMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialReadingDay" ADD CONSTRAINT "EditorialReadingDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "EditorialReadingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EditorialSeries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialSection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialMedia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialMaterial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialReadingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialReadingDay" ENABLE ROW LEVEL SECURITY;

INSERT INTO "EditorialSeries" ("id", "slug", "title", "subtitle", "description", "status", "startsAt", "publishedAt", "defaultThumbnailUrl", "capabilities", "customFields") VALUES
('series_teste_caminhos', 'caminhos-da-graca', 'Caminhos da Graça', 'Uma série fictícia para homologação', 'Série usada exclusivamente para validar o contrato editorial da Central Administrativa.', 'PUBLISHED', '2026-08-02T04:00:00Z', CURRENT_TIMESTAMP, '/images/logo.png', '{"video":true,"audio":true,"materials":true,"readingPlan":true,"sections":true}', '{}');

INSERT INTO "EditorialSection" ("id", "seriesId", "slug", "title", "order") VALUES
('section_teste_inicio', 'series_teste_caminhos', 'inicio', 'O início da caminhada', 1);

INSERT INTO "EditorialMessage" ("id", "seriesId", "sectionId", "slug", "order", "title", "scheduledFor", "biblicalText", "speaker", "summary", "status", "publishedAt") VALUES
('message_teste_01', 'series_teste_caminhos', 'section_teste_inicio', 'graca-que-chama', 1, 'A graça que chama', '2026-08-02T13:30:00Z', 'Efésios 2.1–10', 'Equipe pastoral', 'A salvação começa na iniciativa graciosa de Deus.', 'PUBLISHED', '2026-08-02T13:30:00Z'),
('message_teste_02', 'series_teste_caminhos', 'section_teste_inicio', 'fe-que-caminha', 2, 'A fé que caminha', '2026-08-09T13:30:00Z', 'Hebreus 11.1–16', NULL, 'A fé persevera olhando para as promessas de Deus.', 'SCHEDULED', NULL);

INSERT INTO "EditorialMedia" ("id", "messageId", "type", "title", "url", "provider", "externalId", "order") VALUES
('media_teste_01', 'message_teste_01', 'VIDEO', 'Mensagem completa', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ', 1);

INSERT INTO "EditorialMaterial" ("id", "messageId", "title", "type", "url", "order") VALUES
('material_teste_01', 'message_teste_01', 'Roteiro de estudo', 'PDF', '/docs/exemplo-serie.pdf', 1);

INSERT INTO "EditorialReadingPlan" ("id", "messageId", "theme") VALUES
('reading_teste_01', 'message_teste_01', 'A graça de Deus inicia e sustenta a caminhada.');

INSERT INTO "EditorialReadingDay" ("id", "planId", "order", "dayLabel", "biblicalText", "description") VALUES
('reading_day_teste_01', 'reading_teste_01', 1, 'Segunda', 'Efésios 2.1–10', 'Observe como a salvação é apresentada como dom de Deus.'),
('reading_day_teste_02', 'reading_teste_01', 2, 'Terça', 'Tito 2.11–14', 'Reflita sobre como a graça também nos educa.');
