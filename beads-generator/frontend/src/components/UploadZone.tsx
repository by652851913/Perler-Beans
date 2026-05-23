import { useRef, useState, DragEvent } from 'react';

interface UploadZoneProps {
  onFile: (file: File) => void;
  visible: boolean;
}

/** Generate a colorful demo pattern as a File for testing. */
function generateDemoFile(): File {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 180;
  const ctx = canvas.getContext('2d')!;

  // Rainbow gradient background
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#FF4D6D');
  grad.addColorStop(0.2, '#FFD93D');
  grad.addColorStop(0.4, '#00F5D4');
  grad.addColorStop(0.6, '#4285F4');
  grad.addColorStop(0.8, '#A142F4');
  grad.addColorStop(1, '#FF4D6D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw some geometric shapes
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(120, 90, 50, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(30, 30, 50, 50);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.moveTo(200, 30); ctx.lineTo(220, 100); ctx.lineTo(180, 100); ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.arc(60, 140, 25, 0, Math.PI * 2); ctx.fill();

  const blob = canvas.toDataURL('image/png');
  const byteStr = atob(blob.split(',')[1]);
  const ab = new ArrayBuffer(byteStr.length);
  const ua = new Uint8Array(ab);
  for (let i = 0; i < byteStr.length; i++) ua[i] = byteStr.charCodeAt(i);
  return new File([ab], 'demo-pattern.png', { type: 'image/png' });
}

export default function UploadZone({ onFile, visible }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!visible) return null;

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="glass p-7 mb-5">
      <h2 className="text-lg font-bold mb-4">上传图片</h2>
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200 bg-white/[0.02]
          ${dragOver
            ? 'border-secondary bg-secondary/5 -translate-y-0.5'
            : 'border-white/20 hover:border-secondary hover:bg-secondary/5'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <span className="block text-5xl mb-3">🟡</span>
        <div className="text-lg font-semibold">拖拽图片到此处，或点击上传</div>
        <div className="text-sm text-gray-400 mt-1.5">支持 JPG / PNG，建议使用清晰、色彩分明的图片</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = '';
          }}
        />
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={(e) => { e.stopPropagation(); onFile(generateDemoFile()); }}
          className="px-5 py-2 rounded-full text-sm font-semibold border border-accent/50 text-accent
            hover:bg-accent/10 transition-all"
        >
          使用示例图片快速体验
        </button>
      </div>
    </div>
  );
}
