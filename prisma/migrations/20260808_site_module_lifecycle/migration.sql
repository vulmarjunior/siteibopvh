CREATE TYPE "SiteModuleStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'ARCHIVED');
CREATE TYPE "SiteDirectAccessPolicy" AS ENUM ('AVAILABLE', 'CLOSING_PAGE', 'UNAVAILABLE');

CREATE TABLE "SiteModule" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "path" TEXT NOT NULL,
  "status" "SiteModuleStatus" NOT NULL DEFAULT 'DRAFT',
  "visibleOnHome" BOOLEAN NOT NULL DEFAULT false,
  "visibleInNavigation" BOOLEAN NOT NULL DEFAULT false,
  "directAccess" "SiteDirectAccessPolicy" NOT NULL DEFAULT 'UNAVAILABLE',
  "publicOperationsOpen" BOOLEAN NOT NULL DEFAULT false,
  "permanent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteEdition" (
  "id" TEXT NOT NULL, "moduleId" TEXT NOT NULL, "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL, "year" INTEGER,
  "status" "SiteModuleStatus" NOT NULL DEFAULT 'DRAFT',
  "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3), "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteEdition_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SiteEdition_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "SiteModule"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SiteModule_path_key" ON "SiteModule"("path");
CREATE INDEX "SiteModule_status_idx" ON "SiteModule"("status");
CREATE INDEX "SiteModule_visibleOnHome_status_idx" ON "SiteModule"("visibleOnHome", "status");
CREATE INDEX "SiteModule_visibleInNavigation_status_idx" ON "SiteModule"("visibleInNavigation", "status");
CREATE UNIQUE INDEX "SiteEdition_moduleId_slug_key" ON "SiteEdition"("moduleId", "slug");
CREATE INDEX "SiteEdition_moduleId_status_idx" ON "SiteEdition"("moduleId", "status");
CREATE INDEX "SiteEdition_status_startsAt_endsAt_idx" ON "SiteEdition"("status", "startsAt", "endsAt");

ALTER TABLE "SiteModule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteEdition" ENABLE ROW LEVEL SECURITY;

INSERT INTO "SiteModule" ("id", "name", "path", "status", "visibleOnHome", "visibleInNavigation", "directAccess", "publicOperationsOpen", "permanent") VALUES
('parousia','Da Ascensão à Parousia','/da-ascensao-a-parousia','ACTIVE',true,false,'AVAILABLE',true,false),
('veredas','Veredas IBO','/veredas','ACTIVE',false,false,'AVAILABLE',true,true),
('relogio','Relógio de Oração','/relogio','ACTIVE',false,true,'AVAILABLE',true,true),
('pascoa','Páscoa e Tenebras','/pascoa','ARCHIVED',false,false,'CLOSING_PAGE',false,false),
('moldanos','Molda-nos','/moldanos','ARCHIVED',false,false,'CLOSING_PAGE',false,false),
('ebf','EBF','/ebf','ENDED',false,false,'CLOSING_PAGE',false,false);

INSERT INTO "SiteEdition" ("id", "moduleId", "slug", "name", "year", "status", "metadata") VALUES
('ebf-2026','ebf','2026','EBF 2026 — Em Busca do Maior Tesouro',2026,'ENDED','{"historical":true}'::jsonb);
