import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { getImageUrl } from '../api/client';
import type { GenerateResponse } from '../types';

interface DownloadButtonsProps {
  response: GenerateResponse;
  nameMap: Record<string, string>;
  paletteMap: Record<string, [number, number, number]>;
  gridCanvasRef?: HTMLCanvasElement | null;
}

export default function DownloadButtons({ response, nameMap, paletteMap, gridCanvasRef }: DownloadButtonsProps) {
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const downloadPNG = () => {
    const url = getImageUrl(response.image_url);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bead-pattern-${response.dimensions[0]}x${response.dimensions[1]}.png`;
    a.click();
  };

  const downloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const [w, h] = response.dimensions;
      const doc = new jsPDF({ orientation: w >= h ? 'landscape' : 'portrait', unit: 'mm' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 12;
      let y = margin;

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Dopamine Beads - 拼豆图纸', margin, y);
      y += 8;

      // Info line
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${w} x ${h} 格  |  总豆数: ${response.total_beads}  |  颜色数: ${response.unique_colors}`, margin, y);
      y += 6;

      // Bead grid image
      const imgUrl = getImageUrl(response.image_url);
      const imgData = await fetch(imgUrl).then(r => r.blob()).then(b => blobToDataURL(b));
      const imgProps = doc.getImageProperties(imgData);
      const maxImgW = pageW - margin * 2;
      const maxImgH = pageH * 0.55;
      let imgW = imgProps.width * 0.35; // px → mm approx conversion
      let imgH = imgProps.height * 0.35;
      const scale = Math.min(maxImgW / imgW, maxImgH / imgH, 1);
      imgW *= scale;
      imgH *= scale;
      doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
      y += imgH + 8;

      // Material list table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('材料清单', margin, y);
      y += 6;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      // Table header
      const colW = [(pageW - margin * 2) * 0.12, (pageW - margin * 2) * 0.13, (pageW - margin * 2) * 0.13, (pageW - margin * 2) * 0.12, (pageW - margin * 2) * 0.5];
      const headers = ['色号', '名称', 'RGB', '数量', '颜色'];
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y - 4, pageW - margin * 2, 6, 'F');
      headers.forEach((hdr, i) => {
        doc.text(hdr, margin + colW.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      y += 5;

      // Table rows
      const entries = Object.entries(response.materials);
      const rowH = 5;
      for (const [id, count] of entries) {
        if (y > pageH - margin - 10) {
          doc.addPage();
          y = margin;
        }
        const name = nameMap[id] ?? id;
        const rgb = paletteMap[id] ?? [128, 128, 128];

        doc.text(id, margin, y);
        doc.text(name, margin + colW[0], y);
        doc.text(`${rgb[0]},${rgb[1]},${rgb[2]}`, margin + colW[0] + colW[1], y);
        doc.text(`${count}`, margin + colW[0] + colW[1] + colW[2], y);

        // Color swatch
        const swatchX = margin + colW[0] + colW[1] + colW[2] + colW[3] + 1;
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.rect(swatchX, y - 3, 4, 4, 'F');
        doc.setDrawColor(180, 180, 180);
        doc.rect(swatchX, y - 3, 4, 4, 'S');

        y += rowH;
      }

      doc.save(`bead-pattern-${w}x${h}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF 生成失败，请重试');
    } finally {
      setPdfGenerating(false);
    }
  };

  const downloadCSV = () => {
    let csv = '﻿色号,名称,数量(颗)\n';
    for (const [id, count] of Object.entries(response.materials)) {
      csv += `${id},${nameMap[id] ?? id},${count}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `material-list-${response.dimensions[0]}x${response.dimensions[1]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex gap-3 flex-wrap mt-5">
      <button
        onClick={downloadPNG}
        className="px-6 py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-accent to-accent-dark
          text-[#1a1a2e] shadow-lg shadow-accent/20 transition-all
          hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
      >
        下载图纸 (PNG)
      </button>
      <button
        onClick={downloadPDF}
        disabled={pdfGenerating}
        className="px-6 py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-dark
          text-white shadow-lg shadow-primary/20 transition-all
          hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30
          disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        {pdfGenerating ? '生成中...' : '下载图纸 (PDF)'}
      </button>
      <button
        onClick={downloadCSV}
        className="px-6 py-2.5 rounded-full font-bold text-sm border border-white/25 bg-transparent
          text-gray-300 hover:border-white hover:bg-white/10 transition-all"
      >
        导出材料清单 (CSV)
      </button>
    </div>
  );
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
