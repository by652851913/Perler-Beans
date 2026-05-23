export interface GenerateRequest {
  image: string;
  size: number;
  method: string;
  bead_style: string;
  show_legend: boolean;
  show_grid: boolean;
  show_labels: boolean;
}

export interface GenerateResponse {
  grid: string[][];
  materials: Record<string, number>;
  image_url: string;
  dimensions: [number, number];
  total_beads: number;
  unique_colors: number;
}

export interface PaletteColor {
  id: string;
  name: string;
  rgb: [number, number, number];
  hex: string;
}

export type GenerationPhase =
  | { phase: 'idle' }
  | { phase: 'preview'; file: File; previewUrl: string }
  | { phase: 'generating'; previewUrl: string }
  | { phase: 'done'; previewUrl: string; response: GenerateResponse };
