import type { GenerateResponse } from '../types';

interface SummaryStatsProps {
  response: GenerateResponse;
}

export default function SummaryStats({ response }: SummaryStatsProps) {
  return (
    <div className="flex gap-5 flex-wrap mb-4">
      <div className="bg-white/5 rounded-xl px-5 py-3.5 text-center min-w-[100px]">
        <div className="text-2xl font-black text-secondary">{response.total_beads.toLocaleString()}</div>
        <div className="text-xs text-gray-400 mt-0.5">总拼豆数</div>
      </div>
      <div className="bg-white/5 rounded-xl px-5 py-3.5 text-center min-w-[100px]">
        <div className="text-2xl font-black text-secondary">{response.unique_colors}</div>
        <div className="text-xs text-gray-400 mt-0.5">使用颜色数</div>
      </div>
      <div className="bg-white/5 rounded-xl px-5 py-3.5 text-center min-w-[100px]">
        <div className="text-2xl font-black text-secondary">{response.dimensions[0]}×{response.dimensions[1]}</div>
        <div className="text-xs text-gray-400 mt-0.5">图纸尺寸</div>
      </div>
    </div>
  );
}
