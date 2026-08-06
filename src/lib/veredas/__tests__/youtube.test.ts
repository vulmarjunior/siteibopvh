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

  it('should return error for invalid URL', () => {
    const res = parseYoutubeUrl('not-a-url');
    expect(res.isValid).toBe(false);
    expect(res.youtubeId).toBeNull();
  });
});
