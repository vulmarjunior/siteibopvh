-- Gerenciador do carrossel principal da página inicial.
-- Migração aditiva: preserva todos os dados e cadastra os slides já publicados.

BEGIN;

CREATE TABLE IF NOT EXISTS "HomeBannerSlide" (
  "id" TEXT PRIMARY KEY,
  "subtitle" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "ctaLabel" TEXT NOT NULL,
  "ctaLink" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "altText" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "HomeBannerSlide_active_position_idx"
  ON "HomeBannerSlide"("active", "position");

ALTER TABLE "HomeBannerSlide" ENABLE ROW LEVEL SECURITY;

-- A tabela é acessada exclusivamente pela API protegida do portal.
REVOKE ALL ON TABLE "HomeBannerSlide" FROM anon, authenticated;

INSERT INTO "HomeBannerSlide" ("id", "subtitle", "title", "description", "ctaLabel", "ctaLink", "imageUrl", "altText", "position", "active")
VALUES
  ('home-banner-parousia', 'Nova Série de Mensagens', 'Da Ascensão à Parousia', 'Acompanhe a caminhada da Igreja desde a ascensão de Cristo até a esperança final da Nova Jerusalém.', 'Ver Roteiro e Mensagens', '/da-ascensao-a-parousia', '/images/serie-da-ascensao-a-parousia/arte-principal.png', 'Arte da série Da Ascensão à Parousia', 1, true),
  ('home-banner-comunidade', 'Vida em Comunidade', 'Adoração e Serviço', 'Uma igreja comprometida com a sã doutrina e o amor fraternal.', 'Planeje Sua Visita', '#contato', '/images/slide2.jpg', 'Comunidade reunida em adoração e serviço', 2, true),
  ('home-banner-ebd', 'Escola Bíblica Dominical', 'Crescimento na Graça', 'Estudos aprofundados todos os domingos às 09:30.', 'Nossa programação', '#horarios', '/images/ebd.jpg', 'Escola Bíblica Dominical da Igreja Batista Olaria', 3, true)
ON CONFLICT ("id") DO NOTHING;

-- Bucket público: leitura livre das imagens; gravação somente pela API com service role.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-assets', 'site-assets', true, 4194304, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
