export function interpolateColor(startColor: string, endColor: string, progress: number): string {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const startRgb = hexToRgb(startColor);
  const endRgb = hexToRgb(endColor);

  if (!startRgb || !endRgb) {
    return startColor;
  }

  const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * clampedProgress);
  const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * clampedProgress);
  const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * clampedProgress);

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
