const API_BASE = 'http://localhost:8000';

export async function generatePattern(
  imageBase64: string,
  size: number,
  method: string,
  beadStyle: string,
  showLegend: boolean,
  showGrid: boolean,
  showLabels: boolean,
): Promise<import('../types').GenerateResponse> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageBase64,
      size,
      method,
      bead_style: beadStyle,
      show_legend: showLegend,
      show_grid: showGrid,
      show_labels: showLabels,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getImageUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
