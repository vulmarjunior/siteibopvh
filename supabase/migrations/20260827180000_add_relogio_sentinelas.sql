-- Migration: 20260827180000_add_relogio_sentinelas.sql
-- Descrição: Tabelas para o Relógio de Oração 2.0 (Sentinelas, Passagem do Bastão, Motivos e Testemunhos)

CREATE TABLE IF NOT EXISTS "PrayerSentinel" (
    "id" SERIAL NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cancelToken" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "PrayerSentinel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PrayerSentinel_cancelToken_key" ON "PrayerSentinel"("cancelToken");
CREATE INDEX IF NOT EXISTS "PrayerSentinel_dayOfMonth_active_idx" ON "PrayerSentinel"("dayOfMonth", "active");
CREATE INDEX IF NOT EXISTS "PrayerSentinel_email_active_idx" ON "PrayerSentinel"("email", "active");

CREATE TABLE IF NOT EXISTS "PrayerHandover" (
    "id" SERIAL NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "message" TEXT,
    "verse" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerHandover_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PrayerHandover_date_dayOfMonth_idx" ON "PrayerHandover"("date", "dayOfMonth");
CREATE INDEX IF NOT EXISTS "PrayerHandover_completedAt_idx" ON "PrayerHandover"("completedAt");

CREATE TABLE IF NOT EXISTS "PrayerTopic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Geral',
    "prayedCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerTopic_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PrayerTopic_active_order_idx" ON "PrayerTopic"("active", "order");

CREATE TABLE IF NOT EXISTS "PrayerPraise" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "testimony" TEXT NOT NULL,
    "authorName" TEXT,
    "date" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerPraise_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PrayerPraise_active_order_idx" ON "PrayerPraise"("active", "order");
