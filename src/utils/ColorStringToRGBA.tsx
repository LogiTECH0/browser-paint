import type { RGBA } from "../types/Types";

export function colorStringToRGBA(color: string): RGBA {
  const tempCtx = document.createElement('canvas').getContext('2d')!;
  tempCtx.fillStyle = color;
  const computed = tempCtx.fillStyle;

  // #rrggbb
  if (computed.startsWith('#')) {
    const r = parseInt(computed.slice(1, 3), 16);
    const g = parseInt(computed.slice(3, 5), 16);
    const b = parseInt(computed.slice(5, 7), 16);
    return [r, g, b, 255];
  }

  // rgb(...) або rgba(...)
  const match = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const a = match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255) : 255;
    return [r, g, b, a];
  }

  // fallback (білий)
  return [255, 255, 255, 255];
}
