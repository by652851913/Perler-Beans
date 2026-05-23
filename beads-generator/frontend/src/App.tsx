import { useEffect, useState } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ControlsBar from './components/ControlsBar';
import PreviewPanels from './components/PreviewPanels';
import SummaryStats from './components/SummaryStats';
import MaterialList from './components/MaterialList';
import DownloadButtons from './components/DownloadButtons';
import Toast from './components/Toast';
import { useGeneration } from './hooks/useGeneration';
import { useToast } from './hooks/useToast';
import { initPalette } from './utils/colorMatch';

const API_BASE = 'http://localhost:8000';

interface PaletteEntry {
  id: string;
  name: string;
  rgb: [number, number, number];
}

export default function App() {
  const {
    state, size, setSize, showGrid, setShowGrid, showLabels, setShowLabels,
    beadStyle, setBeadStyle, showLegend, setShowLegend, method, setMethod, handleFile, generate, reset,
  } = useGeneration();
  const { toastMsg, showToast } = useToast();

  // Load palette from backend (id → rgb, id → name maps)
  const [paletteRgb, setPaletteRgb] = useState<Record<string, [number, number, number]>>({});
  const [paletteName, setPaletteName] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_BASE}/api/palette`)
      .then(res => res.json())
      .then((data: PaletteEntry[]) => {
        const rgbMap: Record<string, [number, number, number]> = {};
        const nameMap: Record<string, string> = {};
        for (const c of data) {
          rgbMap[c.id] = c.rgb;
          nameMap[c.id] = c.name;
        }
        setPaletteRgb(rgbMap);
        setPaletteName(nameMap);
        initPalette(data);
      })
      .catch(() => console.warn('Failed to load palette from backend'));
  }, []);

  const handleGenerate = async () => {
    showToast('正在生成图纸...');
    try {
      await generate();
      showToast('拼豆图纸已生成！');
    } catch {
      showToast('生成失败，请重试');
    }
  };

  const canGenerate = state.phase === 'preview';
  const generating = state.phase === 'generating';
  const previewUrl = state.phase === 'idle' ? '' :
    'previewUrl' in state ? state.previewUrl : '';
  const response = state.phase === 'done' ? state.response : null;

  return (
    <div className="relative z-10 max-w-[1300px] mx-auto px-6 pb-16">
      {/* Animated background */}
      <div className="bg-blobs">
        <div className="bg-blob" />
        <div className="bg-blob" />
        <div className="bg-blob" />
      </div>

      <Header />

      <UploadZone
        onFile={(f) => { handleFile(f); showToast('图片已加载，点击「生成图纸」'); }}
        visible={state.phase === 'idle'}
      />

      {state.phase !== 'idle' && (
        <>
          <ControlsBar
            size={size} onSizeChange={setSize}
            beadStyle={beadStyle} onBeadStyleChange={setBeadStyle}
            showLegend={showLegend} onShowLegendChange={setShowLegend}
            showGrid={showGrid} onShowGridChange={setShowGrid}
            showLabels={showLabels} onShowLabelsChange={setShowLabels}
            method={method} onMethodChange={setMethod}
            onGenerate={handleGenerate}
            onReset={reset}
            canGenerate={canGenerate}
            generating={generating}
          />

          <PreviewPanels
            previewUrl={previewUrl}
            response={response}
            paletteMap={paletteRgb}
            localPreviewSize={size}
            isGenerating={generating}
          />
        </>
      )}

      {response && (
        <>
          <div className="glass p-7 mb-5">
            <h2 className="text-lg font-bold mb-4">材料清单</h2>
            <SummaryStats response={response} />
            <MaterialList response={response} paletteMap={paletteRgb} nameMap={paletteName} />
            <DownloadButtons response={response} nameMap={paletteName} paletteMap={paletteRgb} />
          </div>
        </>
      )}

      <Toast msg={toastMsg} />
    </div>
  );
}
