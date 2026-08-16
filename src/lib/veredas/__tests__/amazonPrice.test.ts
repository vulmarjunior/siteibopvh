import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAmazonPriceStale, refreshAmazonAccessPrices } from '../amazonPrice';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe('Amazon price cache', () => {
  it('expires after twelve hours', () => {
    const now = Date.parse('2026-08-16T12:00:00Z');
    expect(isAmazonPriceStale('2026-08-16T01:00:01Z', now)).toBe(false);
    expect(isAmazonPriceStale('2026-08-16T00:00:00Z', now)).toBe(true);
    expect(isAmazonPriceStale(null, now)).toBe(true);
  });

  it('stays disabled when credentials are absent', async () => {
    delete process.env.AMAZON_CREATORS_CLIENT_ID;
    delete process.env.AMAZON_CREATORS_CLIENT_SECRET;
    delete process.env.AMAZON_CREATORS_PARTNER_TAG;
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    expect(await refreshAmazonAccessPrices({}, [{
      id: 1,
      tipo: 'COMPRA',
      gratuito: false,
      url: 'https://www.amazon.com.br/dp/123456789X',
    }])).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('stores the formatted Amazon offer price', async () => {
    process.env.AMAZON_CREATORS_CLIENT_ID = 'client';
    process.env.AMAZON_CREATORS_CLIENT_SECRET = 'secret';
    process.env.AMAZON_CREATORS_PARTNER_TAG = 'ibo-20';
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'token', expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        itemsResult: {
          items: [{
            asin: '123456789X',
            offersV2: { listings: [{ price: { money: { amount: 49.9, currency: 'BRL', displayAmount: 'R$ 49,90' } } }] },
          }],
        },
      }), { status: 200 }));
    const update = vi.fn().mockResolvedValue({});

    const refreshed = await refreshAmazonAccessPrices(
      { curadoriaAcesso: { update } },
      [{ id: 7, tipo: 'COMPRA', gratuito: false, url: 'https://www.amazon.com.br/dp/123456789X' }],
    );

    expect(refreshed).toBe(true);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 7 },
      data: expect.objectContaining({ precoAtual: 49.9, precoMoeda: 'BRL', precoExibicao: 'R$ 49,90' }),
    }));
  });
});
