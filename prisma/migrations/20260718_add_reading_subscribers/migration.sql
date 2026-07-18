-- CreateTable
CREATE TABLE "ReadingSubscriber" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "token" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "ReadingSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadingSubscriber_email_key" ON "ReadingSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingSubscriber_token_key" ON "ReadingSubscriber"("token");
