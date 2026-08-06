import { describe, expect, it, vi } from 'vitest';
import { lookupBookByIsbn, normalizeIsbn } from '../books';

describe('normalizeIsbn', () => {
  it('removes separators and preserves ISBN-10 check digit', () => {
    expect(normalizeIsbn('85-275-0001-X')).toBe('852750001X');
  });
});

describe('lookupBookByIsbn', () => {
  it('returns Google Books metadata and upgrades the cover to HTTPS', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ volumeInfo: {
          title: 'Livro Teste',
          publisher: 'Editora Teste',
          publishedDate: '2024-03-01',
          pageCount: 320,
          industryIdentifiers: [{ type: 'ISBN_13', identifier: '9788527500010' }],
          imageLinks: { large: 'http://books.google.com/cover.jpg' },
        } }],
      }),
    }) as unknown as typeof fetch;

    const result = await lookupBookByIsbn('978-85-275-0001-0', fetcher);

    expect(result.isValid).toBe(true);
    expect(result.metadata?.coverUrl).toBe('https://books.google.com/cover.jpg');
    expect(result.metadata?.publishedYear).toBe(2024);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('uses Open Library when Google Books has no cover', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ volumeInfo: { title: 'Livro sem capa' } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'ISBN:9788527500010': {
            title: 'Livro sem capa',
            cover: { large: 'https://covers.openlibrary.org/example.jpg' },
          },
        }),
      }) as unknown as typeof fetch;

    const result = await lookupBookByIsbn('9788527500010', fetcher);

    expect(result.isValid).toBe(true);
    expect(result.metadata?.source).toBe('GOOGLE_BOOKS');
    expect(result.metadata?.coverUrl).toContain('covers.openlibrary.org');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed ISBN values without calling providers', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch;
    const result = await lookupBookByIsbn('123', fetcher);
    expect(result.isValid).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
