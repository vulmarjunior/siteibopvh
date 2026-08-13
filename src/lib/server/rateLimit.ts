import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';
import type { Request } from 'express';

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

function keyHash(req: Request, discriminator = ''): string {
  const salt = process.env.RATE_LIMIT_SALT || process.env.CRON_SECRET || process.env.DATABASE_URL || 'ibo-rate-limit-local';
  return crypto.createHmac('sha256', salt).update(`${clientIp(req)}:${discriminator}`).digest('hex').slice(0, 40);
}

export async function consumeRateLimit(
  prisma: PrismaClient,
  req: Request,
  options: { scope: string; limit: number; windowMs: number; discriminator?: string },
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const hash = keyHash(req, options.discriminator);
  const since = new Date(Date.now() - options.windowMs);
  const lockKey = `api-rate:${options.scope}:${hash}`;

  const allowed = await prisma.$transaction(async (tx) => {
    // pg_advisory_xact_lock returns PostgreSQL void. $queryRaw attempts to
    // deserialize that value and fails in Prisma before the protected action.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
    const count = await tx.apiRateLimitEvent.count({ where: { scope: options.scope, keyHash: hash, createdAt: { gte: since } } });
    if (count >= options.limit) return false;
    await tx.apiRateLimitEvent.create({ data: { scope: options.scope, keyHash: hash } });
    return true;
  });

  // Best-effort retention cleanup; it does not affect the current request.
  void prisma.apiRateLimitEvent.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }).catch(() => undefined);

  return { allowed, retryAfterSeconds: Math.max(1, Math.ceil(options.windowMs / 1000)) };
}
