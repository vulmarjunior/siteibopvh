CREATE TABLE IF NOT EXISTS "ApiRateLimitEvent" (
  "id" TEXT PRIMARY KEY,
  "scope" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ApiRateLimitEvent_scope_keyHash_createdAt_idx" ON "ApiRateLimitEvent"("scope", "keyHash", "createdAt");
CREATE INDEX IF NOT EXISTS "ApiRateLimitEvent_createdAt_idx" ON "ApiRateLimitEvent"("createdAt");
ALTER TABLE "ApiRateLimitEvent" ENABLE ROW LEVEL SECURITY;
