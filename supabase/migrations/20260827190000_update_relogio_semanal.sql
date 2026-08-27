-- Migration: 20260827190000_update_relogio_semanal.sql
-- Descrição: Atualiza PrayerSentinel e PrayerHandover com suporte a dayOfWeek (escala semanal recorrente)

ALTER TABLE "PrayerSentinel" 
ADD COLUMN IF NOT EXISTS "dayOfWeek" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "dayOfMonth" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "cancelToken" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "PrayerSentinel_dayOfWeek_active_idx" ON "PrayerSentinel"("dayOfWeek", "active");

ALTER TABLE "PrayerHandover" 
ADD COLUMN IF NOT EXISTS "dayOfWeek" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "dayOfMonth" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "PrayerHandover_date_dayOfWeek_idx" ON "PrayerHandover"("date", "dayOfWeek");
