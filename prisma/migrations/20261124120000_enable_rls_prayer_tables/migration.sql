-- Migration: 20261124120000_enable_rls_prayer_tables
-- Descrição: Habilita RLS nas tabelas do Relógio de Oração criadas em
--            20260827180000_add_relogio_sentinelas.
--
-- O acesso é exclusivo do backend Prisma (role dona das tabelas), que ignora
-- RLS por padrão. Sem políticas, as roles anon/authenticated ficam bloqueadas
-- no PostgREST. Não usar FORCE ROW LEVEL SECURITY nem criar políticas públicas.

ALTER TABLE "PrayerSentinel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrayerHandover" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrayerTopic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrayerPraise" ENABLE ROW LEVEL SECURITY;
