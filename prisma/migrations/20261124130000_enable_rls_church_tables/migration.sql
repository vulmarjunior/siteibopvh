-- Migration: 20261124130000_enable_rls_church_tables
-- Descrição: Habilita RLS nas tabelas de história da igreja.
--
-- As tabelas já eram criadas com RLS em 20260904123500_add_church_history,
-- mas o auto-schema de runtime as recriou sem RLS em produção. Esta migration
-- garante o estado correto de forma idempotente.
--
-- O acesso é exclusivo do backend Prisma (role dona das tabelas), que ignora
-- RLS por padrão. Sem políticas, as roles anon/authenticated ficam bloqueadas
-- no PostgREST. Não usar FORCE ROW LEVEL SECURITY nem criar políticas públicas.

ALTER TABLE "ChurchPastorate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChurchHistoryItem" ENABLE ROW LEVEL SECURITY;
