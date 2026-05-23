import type { GenerateResponse } from '../types';

interface MaterialListProps {
  response: GenerateResponse;
  paletteMap: Record<string, [number, number, number]>;
  nameMap: Record<string, string>;
}

export default function MaterialList({ response, paletteMap, nameMap }: MaterialListProps) {
  const entries = Object.entries(response.materials);

  return (
    <div className="flex flex-wrap gap-1.5 max-h-[400px] overflow-y-auto p-1">
      {entries.map(([id, count]) => {
        const rgb = paletteMap[id] ?? [128, 128, 128];
        const name = nameMap[id] ?? id;
        return (
          <div
            key={id}
            className="flex items-center gap-1.5 bg-white/5 rounded-2xl pl-1.5 pr-3 py-1 text-xs font-semibold
              hover:bg-white/10 hover:scale-[1.03] transition-all cursor-default"
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-white/20 flex-shrink-0"
              style={{ backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` }}
            />
            <span className="text-gray-200 max-w-[80px] truncate" title={`${id} ${name}`}>
              {id} {name}
            </span>
            <span className="text-secondary ml-auto">{count}颗</span>
          </div>
        );
      })}
    </div>
  );
}
