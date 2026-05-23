interface ControlsBarProps {
  size: number;
  onSizeChange: (s: number) => void;
  beadStyle: string;
  onBeadStyleChange: (v: string) => void;
  showLegend: boolean;
  onShowLegendChange: (v: boolean) => void;
  showGrid: boolean;
  onShowGridChange: (v: boolean) => void;
  showLabels: boolean;
  onShowLabelsChange: (v: boolean) => void;
  method: string;
  onMethodChange: (m: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  canGenerate: boolean;
  generating: boolean;
}

const SIZES = [32, 48, 64, 96, 128];

export default function ControlsBar({
  size, onSizeChange,
  beadStyle, onBeadStyleChange,
  showLegend, onShowLegendChange,
  showGrid, onShowGridChange,
  showLabels, onShowLabelsChange,
  method, onMethodChange,
  onGenerate, onReset,
  canGenerate, generating,
}: ControlsBarProps) {
  return (
    <div className="glass p-5 mb-5">
      <div className="flex flex-wrap items-center gap-4">

        {/* Resolution */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-400 whitespace-nowrap">分辨率：</label>
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => onSizeChange(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                ${size === s
                  ? 'bg-primary border-primary text-white'
                  : 'bg-transparent border-white/20 text-gray-300 hover:border-secondary hover:text-secondary'}`}
            >{s}</button>
          ))}
          <input
            type="number"
            placeholder="自定义"
            min={4} max={300}
            className="w-20 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-sm text-center
              focus:outline-none focus:border-accent transition-colors"
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (v >= 4 && v <= 300) onSizeChange(v);
            }}
          />
        </div>

        {/* Method */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-400">算法：</label>
          <select
            value={method}
            onChange={(e) => onMethodChange(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-sm cursor-pointer
              focus:outline-none focus:border-accent"
          >
            <option value="lab">LAB 感知</option>
            <option value="weighted">加权 RGB</option>
            <option value="euclidean">欧几里得</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-4 ml-auto">
          <label className="flex items-center gap-1.5 text-xs text-gray-500" title="常见拼豆底板: 29×29 (方形), 50×50 (大方形), 29×49 (圆形底板)">
            底板参考: <span className="text-secondary">29²</span> <span className="text-gray-600">|</span> <span className="text-secondary">50²</span>
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={beadStyle === 'circle'} onChange={(e) => onBeadStyleChange(e.target.checked ? 'circle' : 'square')}
              className="w-4 h-4 accent-primary cursor-pointer" />
            圆形拼豆
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showLegend} onChange={(e) => onShowLegendChange(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer" />
            图例
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showGrid} onChange={(e) => onShowGridChange(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer" />
            网格线
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showLabels} onChange={(e) => onShowLabelsChange(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer" />
            色号
          </label>

          <button
            onClick={onReset}
            className="px-4 py-1.5 rounded-full text-sm font-semibold border border-white/25 bg-transparent
              text-gray-300 hover:border-white hover:bg-white/10 transition-all"
          >重新上传</button>
        </div>
      </div>

      {/* Generate button */}
      <div className="mt-4">
        <button
          disabled={!canGenerate || generating}
          onClick={onGenerate}
          className="px-8 py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-dark
            text-white shadow-lg shadow-primary/30 transition-all
            hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40
            disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {generating ? '生成中...' : '生成图纸'}
        </button>
      </div>
    </div>
  );
}
