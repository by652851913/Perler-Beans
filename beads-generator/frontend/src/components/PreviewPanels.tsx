import type { GenerateResponse } from '../types';
import OriginalPreview from './OriginalPreview';
import PixelatedPreview from './PixelatedPreview';
import BeadGridPreview from './BeadGridPreview';

interface PreviewPanelsProps {
  previewUrl: string;
  response: GenerateResponse | null;
  paletteMap: Record<string, [number, number, number]>;
  localPreviewSize?: number;
  isGenerating?: boolean;
}

export default function PreviewPanels({ previewUrl, response, paletteMap, localPreviewSize, isGenerating }: PreviewPanelsProps) {
  if (!previewUrl) return null;

  // During preview phase (before backend generation), show local real-time pixelation
  const showLocalPreview = !response && !isGenerating;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <OriginalPreview previewUrl={previewUrl} />
      <PixelatedPreview
        grid={response?.grid ?? []}
        palette={paletteMap}
        localPreviewUrl={showLocalPreview ? previewUrl : undefined}
        localPreviewSize={showLocalPreview ? localPreviewSize : undefined}
      />
      <div className="lg:col-span-2">
        <BeadGridPreview
          imageUrl={response?.image_url ?? ''}
          dimensions={response?.dimensions ?? [0, 0]}
        />
      </div>
    </div>
  );
}
