-- Garante a edição histórica antes de vincular inscrições existentes.
INSERT INTO "SiteEdition" ("id", "moduleId", "slug", "name", "year", "status", "createdAt", "updatedAt")
VALUES ('ebf-2026', 'ebf', '2026', 'EBF 2026 — Em Busca do Maior Tesouro', 2026, 'ENDED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "EbfRegistration" ADD COLUMN "editionId" TEXT;

UPDATE "EbfRegistration"
SET "editionId" = 'ebf-2026'
WHERE "editionId" IS NULL;

ALTER TABLE "EbfRegistration" ALTER COLUMN "editionId" SET NOT NULL;

ALTER TABLE "EbfRegistration"
ADD CONSTRAINT "EbfRegistration_editionId_fkey"
FOREIGN KEY ("editionId") REFERENCES "SiteEdition"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "EbfRegistration_editionId_createdAt_idx"
ON "EbfRegistration"("editionId", "createdAt");

ALTER TABLE "EbfRegistration" ENABLE ROW LEVEL SECURITY;
