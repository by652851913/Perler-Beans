import { useEffect, useRef, useState } from 'react';
import { pixelateAndMatch } from '../utils/colorMatch';

interface PixelatedPreviewProps {
  grid: string[][];
  palette: Record<string, [number, number, number]>;
  /** When provided, performs client-side pixelation for real-time preview */
  localPreviewUrl?: string;
  localPreviewSize?: number;
}

export default function PixelatedPreview({ grid, palette, localPreviewUrl, localPreviewSize }: PixelatedPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState<[number, number]>([0, 0]);
  const processingRef = useRef(0);

  // Real-time local pixelation when adjusting resolution
  useEffect(() => {
    if (!localPreviewUrl || !localPreviewSize) return;

    const token = ++processingRef.current;
    let cancelled = false;

    pixelateAndMatch(localPreviewUrl, localPreviewSize).then(({ canvas, grid: localGrid }) => {
      if (cancelled || token !== processingRef.current) return;
      const target = canvasRef.current;
      if (!target) return;
      target.width = canvas.width;
      target.height = canvas.height;
      target.getContext('2d')!.drawImage(canvas, 0, 0);
      setDims([localGrid[0]?.length ?? 0, localGrid.length]);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [localPreviewUrl, localPreviewSize]);

  // Backend data rendering (when available)
  useEffect(() => {
    if (localPreviewUrl) return; // local preview takes priority
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;

    const h = grid.length;
    const w = grid[0].length;
    setDims([w, h]);
    const scale = Math.max(2, Math.floor(400 / Math.max(w, h)));

    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const defaultRgb: [number, number, number] = [255, 255, 255];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const [r, g, b] = palette[grid[y][x]] ?? defaultRgb;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }, [grid, palette, localPreviewUrl]);

  const isEmpty = (!localPreviewUrl && grid.length === 0) || (localPreviewUrl && dims[0] === 0);

  return (
    <div className="glass overflow-hidden">
      <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-white/5">
        像素化预览
        {dims[0] > 0 && <span className="ml-2 font-normal normal-case">{dims[0]} × {dims[1]}</span>}
        {localPreviewUrl && <span className="ml-2 text-accent font-normal">实时</span>}
      </div>
      <div className="p-4 flex items-center justify-center min-h-[280px] bg-black/15">
        {isEmpty ? (
          <span className="text-gray-500 text-5xl opacity-50">🔲</span>
        ) : (
          <canvas ref={canvasRef} className="max-w-full h-auto" style={{ imageRendering: 'pixelated' }} />
        )}
      </div>
    </div>
  );
}
