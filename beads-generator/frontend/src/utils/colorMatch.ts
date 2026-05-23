/**
 * Client-side LAB color matching engine.
 * Mirrors the backend color_matcher.py logic for instant local preview.
 */

export interface PaletteColor {
  id: string;
  rgb: [number, number, number];
  lab: [number, number, number];
}

let _paletteLab: PaletteColor[] | null = null;

export function initPalette(colors: { id: string; rgb: [number, number, number] }[]) {
  _paletteLab = colors.map(c => ({
    id: c.id,
    rgb: c.rgb,
    lab: rgbToLab(c.rgb[0], c.rgb[1], c.rgb[2]),
  }));
}

function srgbToLinear(c: number): number {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r), gl = srgbToLinear(g), bl = srgbToLinear(b);
  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) * 100;
  const y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750) * 100;
  const z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) * 100;
  const xn = 95.047, yn = 100.0, zn = 108.883;
  const f = (t: number) => {
    const d = 6 / 29;
    return t > d ** 3 ? Math.cbrt(t) : t / (3 * d * d) + 4 / 29;
  };
  const L = 116 * f(y / yn) - 16;
  const A = 500 * (f(x / xn) - f(y / yn));
  const B = 200 * (f(y / yn) - f(z / zn));
  return [L, A, B];
}

function deltaE(l1: number[], l2: number[]): number {
  return Math.sqrt((l1[0] - l2[0]) ** 2 + (l1[1] - l2[1]) ** 2 + (l1[2] - l2[2]) ** 2);
}

function findClosest(r: number, g: number, b: number): PaletteColor {
  const target = rgbToLab(r, g, b);
  let best = _paletteLab![0];
  let bestD = Infinity;
  for (const c of _paletteLab!) {
    const d = deltaE(target, c.lab);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

export function pixelateAndMatch(
  imageUrl: string,
  targetSize: number
): Promise<{ canvas: HTMLCanvasElement; grid: string[][] }> {
  return new Promise((resolve, reject) => {
    if (!_paletteLab) { reject(new Error('Palette not initialized')); return; }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.width, h = img.height;
      let outW: number, outH: number;
      if (w >= h) { outW = targetSize; outH = Math.max(1, Math.round(targetSize * h / w)); }
      else { outH = targetSize; outW = Math.max(1, Math.round(targetSize * w / h)); }

      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, outW, outH);
      const imageData = ctx.getImageData(0, 0, outW, outH);

      const grid: string[][] = [];
      const displayCanvas = document.createElement('canvas');
      const scale = Math.max(2, Math.floor(400 / Math.max(outW, outH)));
      displayCanvas.width = outW * scale;
      displayCanvas.height = outH * scale;
      const dCtx = displayCanvas.getContext('2d')!;
      dCtx.imageSmoothingEnabled = false;

      for (let y = 0; y < outH; y++) {
        const row: string[] = [];
        for (let x = 0; x < outW; x++) {
          const i = (y * outW + x) * 4;
          const pxR = imageData.data[i], pxG = imageData.data[i + 1], pxB = imageData.data[i + 2], pxA = imageData.data[i + 3];
          const matched = pxA < 30 ? findClosest(255, 255, 255) : findClosest(pxR, pxG, pxB);
          row.push(matched.id);
          dCtx.fillStyle = `rgb(${matched.rgb[0]},${matched.rgb[1]},${matched.rgb[2]})`;
          dCtx.fillRect(x * scale, y * scale, scale, scale);
        }
        grid.push(row);
      }

      resolve({ canvas: displayCanvas, grid });
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageUrl;
  });
}
