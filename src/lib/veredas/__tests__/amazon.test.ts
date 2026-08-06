import { describe, it, expect } from 'vitest';
import { parseAmazonUrl } from '../amazon';

describe('parseAmazonUrl', () => {
  it('should extract ASIN from standard Amazon URL', () => {
    const res = parseAmazonUrl('https://www.amazon.com.br/dp/8527500010');
    expect(res.isValid).toBe(true);
    expect(res.asin).toBe('8527500010');
  });

  it('should preserve affiliate tag if provided', () => {
    const res = parseAmazonUrl('https://www.amazon.com.br/dp/8527500010', 'ibopvh-20');
    expect(res.canonicalUrl).toContain('tag=ibopvh-20');
  });

  it('should preserve the affiliate tag already present in the URL', () => {
    const res = parseAmazonUrl('https://www.amazon.com.br/dp/8527500010?tag=ibopvh-20');
    expect(res.canonicalUrl).toBe('https://www.amazon.com.br/dp/8527500010?tag=ibopvh-20');
  });

  it('should flag shortened URLs without ASIN to avoid SSRF', () => {
    const res = parseAmazonUrl('https://amzn.to/3xyz');
    expect(res.isValid).toBe(true);
    expect(res.asin).toBeNull();
    expect(res.error).toBeDefined();
  });
});
