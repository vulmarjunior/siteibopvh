export interface AmazonParseResult {
  asin: string | null;
  canonicalUrl: string | null;
  isValid: boolean;
  error?: string;
}

/**
 * Extracts ASIN from Amazon URL and validates canonical link structure safely.
 * Prevents SSRF by avoiding arbitrary external HTTP requests for shortened URLs in the MVP.
 */
export function parseAmazonUrl(url: string, affiliateTag?: string): AmazonParseResult {
  if (!url || typeof url !== 'string') {
    return { asin: null, canonicalUrl: null, isValid: false, error: 'URL inválida' };
  }

  const trimmedUrl = url.trim();

  // Match standard Amazon URL patterns for ASIN (10 alphanumeric characters)
  const asinMatch =
    trimmedUrl.match(/\/dp\/([A-Z0-9]{10})/i) ||
    trimmedUrl.match(/\/gp\/product\/([A-Z0-9]{10})/i) ||
    trimmedUrl.match(/\/ASIN\/([A-Z0-9]{10})/i);

  if (asinMatch && asinMatch[1]) {
    const asin = asinMatch[1].toUpperCase();
    let canonicalUrl = `https://www.amazon.com.br/dp/${asin}`;
    if (affiliateTag) {
      canonicalUrl += `?tag=${encodeURIComponent(affiliateTag)}`;
    }
    return { asin, canonicalUrl, isValid: true };
  }

  // Shortened URLs (e.g. amzn.to) require full URL for MVP to avoid SSRF
  if (trimmedUrl.includes('amzn.to') || trimmedUrl.includes('a.co')) {
    return {
      asin: null,
      canonicalUrl: trimmedUrl,
      isValid: true,
      error: 'URL encurtada detectada. Para o MVP, preencha também o ASIN manualmente ou forneça o link completo da Amazon.',
    };
  }

  return {
    asin: null,
    canonicalUrl: trimmedUrl,
    isValid: true,
  };
}
