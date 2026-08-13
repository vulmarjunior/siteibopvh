import { describe, it, expect } from 'vitest';
import { parseYoutubeUrl } from '../youtube';

describe('parseYoutubeUrl', () => {
  it('should extract youtubeId from watch?v= URL', () => {
    const res = parseYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.youtubeId).toBe('dQw4w9WgXcQ');
    expect(res.thumbnailUrl).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('should extract youtubeId from short youtu.be URL', () => {
    const res = parseYoutubeUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.youtubeId).toBe('dQw4w9WgXcQ');
  });

  it.each([
    'https://www.youtube.com/live/dQw4w9WgXcQ?si=example',
    'https://youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
  ])('should extract youtubeId from supported format %s', (url) => {
    expect(parseYoutubeUrl(url).youtubeId).toBe('dQw4w9WgXcQ');
  });

  it('should reject lookalike domains', () => {
    expect(parseYoutubeUrl('https://youtube.com.example.org/watch?v=dQw4w9WgXcQ').isValid).toBe(false);
  });

  it('should return error for invalid URL', () => {
    const res = parseYoutubeUrl('not-a-url');
    expect(res.isValid).toBe(false);
    expect(res.youtubeId).toBeNull();
  });
});
