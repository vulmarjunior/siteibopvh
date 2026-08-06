import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

export function generateIpHash(ip: string): string {
  if (!ip) return 'unknown';
  const salt = 'veredas_ibo_salt_2026';
  return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 32);
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks database-persisted rate limits for link report submissions:
 * - Max 5 reports per hour per IP
 * - Max 1 report per 30 minutes for the same access link per IP
 */
export async function checkReportRateLimit(
  prisma: PrismaClient,
  ipHash: string,
  acessoId: number
): Promise<RateLimitCheckResult> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

  // 1. Check total reports from this IP in the last hour
  const hourlyCount = await prisma.curadoriaLinkRelato.count({
    where: {
      ipHash,
      criadoEm: { gte: oneHourAgo },
    },
  });

  if (hourlyCount >= 5) {
    return {
      allowed: false,
      reason: 'Limite de relatos atingido para este IP (máximo de 5 por hora). Tente novamente mais tarde.',
    };
  }

  // 2. Check reports for this specific access link from this IP in the last 30 minutes
  const recentLinkCount = await prisma.curadoriaLinkRelato.count({
    where: {
      ipHash,
      acessoId,
      criadoEm: { gte: thirtyMinAgo },
    },
  });

  if (recentLinkCount >= 1) {
    return {
      allowed: false,
      reason: 'Um relato para este link já foi enviado recentemente. Agradecemos sua colaboração.',
    };
  }

  return { allowed: true };
}
