import { describe, expect, it, vi } from 'vitest';
import { lookupBookByIsbn, normalizeIsbn } from '../books';

describe('normalizeIsbn', () => {
  it('removes separators and preserves ISBN-10 check digit', () => {
    expect(normalizeIsbn('85-275-0001-X')).toBe('852750001X');
  });
});

describe('lookupBookByIsbn', () => {
  it('returns BrasilAPI metadata and upgrades the cover to HTTPS', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        title: 'Livro Teste',
        publisher: 'Editora Teste',
        year: 2024,
        page_count: 320,
        cover_url: 'http://example.com/cover.jpg',
      }),
    }) as unknown as typeof fetch;

    const result = await lookupBookByIsbn('978-85-275-0001-0', fetcher);

    expect(result.isValid).toBe(true);
    expect(result.metadata?.source).toBe('BRASIL_API');
    expect(result.metadata?.coverUrl).toBe('https://example.com/cover.jpg');
    expect(result.metadata?.publishedYear).toBe(2024);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('combines BrasilAPI metadata with an Open Library cover', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: 'Livro brasileiro',
          publisher: 'Editora Brasileira',
          year: 2024,
          page_count: 224,
          cover_url: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'ISBN:9788527500010': {
            title: 'Livro brasileiro',
            cover: { large: 'https://covers.openlibrary.org/example.jpg' },
          },
        }),
      }) as unknown as typeof fetch;

    const result = await lookupBookByIsbn('9788527500010', fetcher);

    expect(result.isValid).toBe(true);
    expect(result.metadata?.source).toBe('BRASIL_API');
    expect(result.metadata?.publisher).toBe('Editora Brasileira');
    expect(result.metadata?.coverUrl).toContain('covers.openlibrary.org');
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('falls back to Google Books for international ISBN metadata', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{ volumeInfo: {
            title: 'International Book',
            authors: ['Author One'],
            description: '<p>A useful <b>synopsis</b>.</p>',
            imageLinks: { large: 'http://books.google.com/cover.jpg' },
          } }],
        }),
      }) as unknown as typeof fetch;

    const result = await lookupBookByIsbn('9780385533225', fetcher);

    expect(result.isValid).toBe(true);
    expect(result.metadata?.source).toBe('GOOGLE_BOOKS');
    expect(result.metadata?.coverUrl).toBe('https://books.google.com/cover.jpg');
    expect(result.metadata?.authors).toEqual(['Author One']);
    expect(result.metadata?.description).toBe('A useful synopsis.');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed ISBN values without calling providers', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch;
    const result = await lookupBookByIsbn('123', fetcher);
    expect(result.isValid).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
