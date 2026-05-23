import { getImageUrl } from '../api/client';

interface BeadGridPreviewProps {
  imageUrl: string;
  dimensions: [number, number];
}

export default function BeadGridPreview({ imageUrl, dimensions }: BeadGridPreviewProps) {
  return (
    <div className="glass overflow-hidden">
      <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-white/5">
        拼豆图纸
        <span className="ml-2 font-normal normal-case text-xs">{dimensions[0]} × {dimensions[1]} 格</span>
      </div>
      <div className="p-4 flex items-start justify-center bg-black/15 max-h-[600px] overflow-auto">
        {!imageUrl ? (
          <span className="text-gray-500 text-5xl opacity-50 py-20">🧩</span>
        ) : (
          <img
            src={getImageUrl(imageUrl)}
            alt="拼豆图纸"
            className="max-w-full"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
      </div>
    </div>
  );
}
