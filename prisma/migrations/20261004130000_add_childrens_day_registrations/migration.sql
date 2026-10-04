CREATE TYPE "ChildrensDayMemberKind" AS ENUM ('CRIANCA', 'FAMILIAR');

CREATE TABLE "ChildrensDayRegistration" (
  "id" SERIAL NOT NULL,
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
  "cancelledAt" TIMESTAMP(3),
  CONSTRAINT "ChildrensDayRegistration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChildrensDayMember" (
  "id" SERIAL NOT NULL,
  "registrationId" INTEGER NOT NULL,
  "kind" "ChildrensDayMemberKind" NOT NULL,
  "name" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChildrensDayMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChildrensDayRegistration_createdAt_idx" ON "ChildrensDayRegistration"("createdAt");
CREATE INDEX "ChildrensDayRegistration_editionId_createdAt_idx" ON "ChildrensDayRegistration"("editionId", "createdAt");
CREATE INDEX "ChildrensDayMember_registrationId_kind_idx" ON "ChildrensDayMember"("registrationId", "kind");

ALTER TABLE "ChildrensDayRegistration"
ADD CONSTRAINT "ChildrensDayRegistration_editionId_fkey"
FOREIGN KEY ("editionId") REFERENCES "SiteEdition"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChildrensDayMember"
ADD CONSTRAINT "ChildrensDayMember_registrationId_fkey"
FOREIGN KEY ("registrationId") REFERENCES "ChildrensDayRegistration"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChildrensDayRegistration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChildrensDayMember" ENABLE ROW LEVEL SECURITY;
