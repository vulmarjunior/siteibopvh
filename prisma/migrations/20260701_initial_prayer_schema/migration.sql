-- Baseline das tabelas originais do Relógio de Oração.
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "timeStart" TEXT NOT NULL,
    "timeEnd" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "prayerThemes" TEXT,
    "personalRequest" TEXT,
    "cancelToken" TEXT NOT NULL,
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Config_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "PrayerTheme" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PrayerTheme_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Reservation_cancelToken_key" ON "Reservation"("cancelToken");
CREATE INDEX "Reservation_date_timeStart_idx" ON "Reservation"("date", "timeStart");
