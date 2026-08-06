export interface BookMetadata {
  title: string | null;
  subtitle: string | null;
  authors: string[];
  publisher: string | null;
  publishedYear: number | null;
  pageCount: number | null;
  isbn10: string | null;
  isbn13: string | null;
  coverUrl: string | null;
  source: 'GOOGLE_BOOKS' | 'OPEN_LIBRARY';
}

export interface BookLookupResult {
  isValid: boolean;
  metadata: BookMetadata | null;
  error?: string;
}

type FetchLike = typeof fetch;

export function normalizeIsbn(value: string) {
  return String(value || '').replace(/[^0-9X]/gi, '').toUpperCase();
}

function secureUrl(value?: string | null) {
  return value ? value.replace(/^http:/, 'https:') : null;
}

function yearFromDate(value?: string) {
  const year = Number(value?.match(/^\d{4}/)?.[0]);
  return Number.isFinite(year) ? year : null;
}

export async function lookupBookByIsbn(
  rawIsbn: string,
  fetcher: FetchLike = fetch,
): Promise<BookLookupResult> {
  const isbn = normalizeIsbn(rawIsbn);
  if (![10, 13].includes(isbn.length)) {
    return { isValid: false, metadata: null, error: 'Informe um ISBN-10 ou ISBN-13 valido' };
  }

  let googleMetadata: BookMetadata | null = null;

  try {
    const googleResponse = await fetcher(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&maxResults=1&printType=books`,
      { signal: AbortSignal.timeout(7000) },
    );
    if (googleResponse.ok) {
      const payload: any = await googleResponse.json();
      const info = payload.items?.[0]?.volumeInfo;
      if (info) {
        const identifiers = info.industryIdentifiers || [];
        googleMetadata = {
          title: info.title || null,
          subtitle: info.subtitle || null,
          authors: Array.isArray(info.authors) ? info.authors : [],
          publisher: info.publisher || null,
          publishedYear: yearFromDate(info.publishedDate),
          pageCount: Number.isFinite(Number(info.pageCount)) ? Number(info.pageCount) : null,
          isbn10: identifiers.find((item: any) => item.type === 'ISBN_10')?.identifier || (isbn.length === 10 ? isbn : null),
          isbn13: identifiers.find((item: any) => item.type === 'ISBN_13')?.identifier || (isbn.length === 13 ? isbn : null),
          coverUrl: secureUrl(
            info.imageLinks?.extraLarge || info.imageLinks?.large || info.imageLinks?.medium ||
              info.imageLinks?.small || info.imageLinks?.thumbnail,
          ),
          source: 'GOOGLE_BOOKS',
        };
        if (googleMetadata.coverUrl) return { isValid: true, metadata: googleMetadata };
      }
    }
  } catch (error) {
    console.warn('Google Books lookup failed:', error);
  }

  try {
    const key = `ISBN:${isbn}`;
    const openLibraryResponse = await fetcher(
      `https://openlibrary.org/api/books?bibkeys=${encodeURIComponent(key)}&format=json&jscmd=data`,
      { signal: AbortSignal.timeout(7000) },
    );
    if (openLibraryResponse.ok) {
      const payload: any = await openLibraryResponse.json();
      const info = payload[key];
      if (info) {
        const openLibraryMetadata: BookMetadata = {
          title: info.title || null,
          subtitle: info.subtitle || null,
          authors: Array.isArray(info.authors) ? info.authors.map((author: any) => author.name).filter(Boolean) : [],
          publisher: info.publishers?.[0]?.name || null,
          publishedYear: yearFromDate(info.publish_date),
          pageCount: Number.isFinite(Number(info.number_of_pages)) ? Number(info.number_of_pages) : null,
          isbn10: isbn.length === 10 ? isbn : null,
          isbn13: isbn.length === 13 ? isbn : null,
          coverUrl: secureUrl(info.cover?.large || info.cover?.medium || info.cover?.small),
          source: 'OPEN_LIBRARY',
        };

        return {
          isValid: true,
          metadata: googleMetadata
            ? { ...openLibraryMetadata, ...googleMetadata, coverUrl: openLibraryMetadata.coverUrl }
            : openLibraryMetadata,
        };
      }
    }
  } catch (error) {
    console.warn('Open Library lookup failed:', error);
  }

  if (googleMetadata) return { isValid: true, metadata: googleMetadata };
  return { isValid: false, metadata: null, error: 'Livro nao encontrado pelo ISBN informado' };
}
