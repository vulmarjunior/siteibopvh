import { parseAmazonUrl } from './amazon.js';

const MARKETPLACE = 'www.amazon.com.br';
const TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const API_URL = 'https://creatorsapi.amazon/catalog/v1/getItems';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

interface AmazonPriceConfig {
  clientId: string;
  clientSecret: string;
  partnerTag: string;
}

interface CachedToken {
  value: string;
  expiresAt: number;
}

export interface PriceableAccess {
  id: number;
  url: string;
  tipo: string;
  gratuito: boolean;
  precoConsultadoEm?: Date | string | null;
}

let cachedToken: CachedToken | null = null;

function getConfig(): AmazonPriceConfig | null {
  const clientId = process.env.AMAZON_CREATORS_CLIENT_ID?.trim();
  const clientSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET?.trim();
  const partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG?.trim();
  return clientId && clientSecret && partnerTag ? { clientId, clientSecret, partnerTag } : null;
}

async function getAccessToken(config: AmazonPriceConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(5_000),
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: 'creatorsapi::default',
    }),
  });
  if (!response.ok) throw new Error(`Amazon Creators token request failed (${response.status})`);

  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new Error('Amazon Creators token response did not include access_token');
  cachedToken = {
    value: payload.access_token,
    expiresAt: Date.now() + Math.max(60, payload.expires_in || 3600) * 1000,
  };
  return cachedToken.value;
}

function extractPrices(payload: any): Map<string, { amount: number; currency: string; displayAmount: string }> {
  const prices = new Map<string, { amount: number; currency: string; displayAmount: string }>();
  for (const item of payload?.itemsResult?.items || []) {
    const money = item?.offersV2?.listings?.[0]?.price?.money;
    if (item?.asin && Number.isFinite(Number(money?.amount)) && money?.currency && money?.displayAmount) {
      prices.set(String(item.asin).toUpperCase(), {
        amount: Number(money.amount),
        currency: String(money.currency),
        displayAmount: String(money.displayAmount),
      });
    }
  }
  return prices;
}

async function fetchAmazonPrices(asins: string[], config: AmazonPriceConfig) {
  const token = await getAccessToken(config);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-marketplace': MARKETPLACE,
    },
    signal: AbortSignal.timeout(5_000),
    body: JSON.stringify({
      itemIds: asins,
      itemIdType: 'ASIN',
      marketplace: MARKETPLACE,
      partnerTag: config.partnerTag,
      resources: ['offersV2.listings.price'],
    }),
  });
  if (!response.ok) throw new Error(`Amazon Creators getItems request failed (${response.status})`);
  return extractPrices(await response.json());
}

export function isAmazonPriceStale(consultedAt?: Date | string | null, now = Date.now()) {
  if (!consultedAt) return true;
  const timestamp = new Date(consultedAt).getTime();
  return !Number.isFinite(timestamp) || now - timestamp >= CACHE_TTL_MS;
}

/** Refreshes stale Amazon purchase-link prices. Missing credentials disable the feature safely. */
export async function refreshAmazonAccessPrices(prisma: any, accesses: PriceableAccess[]): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  const candidates = accesses
    .filter((access) => access.tipo === 'COMPRA' && !access.gratuito && isAmazonPriceStale(access.precoConsultadoEm))
    .map((access) => ({ access, parsed: parseAmazonUrl(access.url) }))
    .filter(({ parsed }) => parsed.isValid && parsed.asin);
  if (!candidates.length) return false;

  const asins = [...new Set(candidates.map(({ parsed }) => parsed.asin!))].slice(0, 10);
  const selectedCandidates = candidates.filter(({ parsed }) => asins.includes(parsed.asin!));
  const prices = await fetchAmazonPrices(asins, config);
  const consultedAt = new Date();

  await Promise.all(selectedCandidates.map(({ access, parsed }) => {
    const price = prices.get(parsed.asin!);
    return prisma.curadoriaAcesso.update({
      where: { id: access.id },
      data: {
        precoAtual: price?.amount ?? null,
        precoMoeda: price?.currency ?? null,
        precoExibicao: price?.displayAmount ?? null,
        precoConsultadoEm: consultedAt,
      },
    });
  }));
  return true;
}
