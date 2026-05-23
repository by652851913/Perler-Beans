import { useState, useCallback, useRef } from 'react';
import type { GenerationPhase, GenerateResponse } from '../types';
import { generatePattern } from '../api/client';

export function useGeneration() {
  const [state, setState] = useState<GenerationPhase>({ phase: 'idle' });
  const [size, setSize] = useState(64);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [beadStyle, setBeadStyle] = useState('square');
  const [showLegend, setShowLegend] = useState(false);
  const [method, setMethod] = useState('lab');
  const abortRef = useRef<AbortController | null>(null);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setState({ phase: 'preview', file, previewUrl: url });
  }, []);

  const generate = useCallback(async () => {
    if (state.phase !== 'preview') return;

    const file = state.file;
    const previewUrl = state.previewUrl;

    setState({ phase: 'generating', previewUrl });

    // Compress image before encoding to base64
    const base64 = await compressAndEncode(file);

    try {
      const response: GenerateResponse = await generatePattern(
        base64, size, method, beadStyle, showLegend, showGrid, showLabels
      );
      setState({ phase: 'done', previewUrl, response });
    } catch (err: any) {
      alert('生成失败: ' + err.message);
      setState({ phase: 'preview', file, previewUrl });
    }
  }, [state, size, method, beadStyle, showLegend, showGrid, showLabels]);

  const reset = useCallback(() => {
    if (state.phase === 'preview' || state.phase === 'generating' || state.phase === 'done') {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ phase: 'idle' });
  }, [state]);

  return {
    state, size, setSize, showGrid, setShowGrid, showLabels, setShowLabels,
    beadStyle, setBeadStyle, showLegend, setShowLegend, method, setMethod, handleFile, generate, reset,
  };
}

/** Resize image to max 800px on long edge, then encode as base64 data URI. */
async function compressAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 800;
      let w = img.width, h = img.height;
      if (Math.max(w, h) > maxDim) {
        if (w >= h) { h = Math.round(maxDim * h / w); w = maxDim; }
        else { w = Math.round(maxDim * w / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
}
