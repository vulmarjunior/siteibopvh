-- Hotsite "Dia das Crianças" (/criancas) — migração aditiva.
-- Cria as tabelas de inscrição, registra o módulo/edição e publica o banner na Home.
-- Aplicar manualmente no projeto de produção via plugin oficial do Supabase.

BEGIN;

DO $$ BEGIN
  CREATE TYPE "ChildrensDayMemberKind" AS ENUM ('CRIANCA', 'FAMILIAR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "ChildrensDayRegistration" (
  "id" SERIAL PRIMARY KEY,
  "editionId" TEXT NOT NULL,
  "guardianName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "bringsBreakfast" BOOLEAN NOT NULL DEFAULT false,
  "bringsSideDish" BOOLEAN NOT NULL DEFAULT false,
  "bringsDrink" BOOLEAN NOT NULL DEFAULT false,
  "breakfastItems" TEXT,
  "sideDishItems" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "ChildrensDayMember" (
  "id" SERIAL PRIMARY KEY,
  "registrationId" INTEGER NOT NULL,
  "kind" "ChildrensDayMemberKind" NOT NULL,
  "name" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ChildrensDayRegistration_createdAt_idx"
  ON "ChildrensDayRegistration"("createdAt");
CREATE INDEX IF NOT EXISTS "ChildrensDayRegistration_editionId_createdAt_idx"
  ON "ChildrensDayRegistration"("editionId", "createdAt");
CREATE INDEX IF NOT EXISTS "ChildrensDayMember_registrationId_kind_idx"
  ON "ChildrensDayMember"("registrationId", "kind");

DO $$ BEGIN
  ALTER TABLE "ChildrensDayRegistration"
    ADD CONSTRAINT "ChildrensDayRegistration_editionId_fkey"
    FOREIGN KEY ("editionId") REFERENCES "SiteEdition"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ChildrensDayMember"
    ADD CONSTRAINT "ChildrensDayMember_registrationId_fkey"
    FOREIGN KEY ("registrationId") REFERENCES "ChildrensDayRegistration"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "ChildrensDayRegistration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChildrensDayMember" ENABLE ROW LEVEL SECURITY;

-- Acesso exclusivo pela API do portal (Prisma/service role).
REVOKE ALL ON TABLE "ChildrensDayRegistration" FROM anon, authenticated;
REVOKE ALL ON TABLE "ChildrensDayMember" FROM anon, authenticated;

-- Módulo do portal. Operações públicas abertas até o encerramento manual em /admin/modulos.
INSERT INTO "SiteModule" ("id", "name", "path", "status", "visibleOnHome", "visibleInNavigation", "directAccess", "publicOperationsOpen", "permanent", "createdAt", "updatedAt")
VALUES ('criancas', 'Dia das Crianças', '/criancas', 'ACTIVE', false, false, 'AVAILABLE', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Edição do evento (reutilizável anualmente com novas edições).
INSERT INTO "SiteEdition" ("id", "moduleId", "slug", "name", "year", "status", "startsAt", "endsAt", "metadata", "createdAt", "updatedAt")
VALUES (
  'criancas-2026',
  'criancas',
  '2026',
  'Dia das Crianças — IBO 2026',
  2026,
  'ACTIVE',
  '2026-10-11 09:00:00',
  '2026-10-11 16:00:00',
  '{"local":"Espaço de Eventos Casarão","mapsUrl":"https://maps.app.goo.gl/jUkjmX8ZE7poMEPn9","registrationDeadline":"2026-10-08","coordenacao":"Ir. Rojeane"}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- Banner do carrossel principal apontando para o hotsite.
INSERT INTO "HomeBannerSlide" ("id", "subtitle", "title", "description", "ctaLabel", "ctaLink", "imageUrl", "altText", "position", "active", "createdAt", "updatedAt")
VALUES (
  'home-banner-dia-das-criancas-2026',
  '11 de outubro • 9h às 16h • Espaço de Eventos Casarão',
  'Dia das Crianças — IBO',
  'Um dia preparado para as crianças e toda a família, com comunhão, diversão, brincadeiras e momentos especiais juntos. Inscrições até 08 de outubro!',
  'Fazer Inscrição',
  '/criancas',
  '/images/criancas/arte-wide.png',
  'Arte do Dia das Crianças da Igreja Batista Olaria',
  0,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

COMMIT;
