import { describe, it, expect } from 'vitest';
import { parseYoutubePlaylistUrl, parseYoutubeUrl } from '../youtube';

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

describe('parseYoutubePlaylistUrl', () => {
  it('extracts playlist and selected lesson from a watch URL', () => {
    const result = parseYoutubePlaylistUrl('https://www.youtube.com/watch?v=bC7xJEInK5Y&list=PLRPNvughqc8TZCaQ5Qk5Jv3udPxuecoR4');
    expect(result).toMatchObject({
      isValid: true,
      playlistId: 'PLRPNvughqc8TZCaQ5Qk5Jv3udPxuecoR4',
      firstVideoId: 'bC7xJEInK5Y',
      embedUrl: 'https://www.youtube.com/embed/videoseries?list=PLRPNvughqc8TZCaQ5Qk5Jv3udPxuecoR4',
    });
  });

  it('accepts a pure playlist URL', () => {
    expect(parseYoutubePlaylistUrl('https://www.youtube.com/playlist?list=PLRPNvughqc8TZCaQ5Qk5Jv3udPxuecoR4').playlistId)
      .toBe('PLRPNvughqc8TZCaQ5Qk5Jv3udPxuecoR4');
  });

  it('rejects a video without a playlist', () => {
    expect(parseYoutubePlaylistUrl('https://youtu.be/bC7xJEInK5Y').isValid).toBe(false);
  });
});
