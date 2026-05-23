interface OriginalPreviewProps {
  previewUrl: string;
}

export default function OriginalPreview({ previewUrl }: OriginalPreviewProps) {
  return (
    <div className="glass overflow-hidden">
      <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-white/5">
        原图
      </div>
      <div className="p-4 flex items-center justify-center min-h-[280px] bg-black/15">
        <img src={previewUrl} alt="原始图片" className="max-w-full max-h-[380px] object-contain rounded-lg" />
      </div>
    </div>
  );
}
