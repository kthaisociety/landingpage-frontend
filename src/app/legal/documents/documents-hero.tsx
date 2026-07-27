"use client";

import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { AsciiGrid } from "@/components/ui/ascii-grid";

export function DocumentsHero() {
  const [textMask, setTextMask] = useState<string | undefined>(undefined);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 130px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("DOCUMENTS", canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => setTextMask(dataUrl));
  }, []);

  return (
    <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <AsciiGrid
          color="rgba(0, 0, 0, 0.2)"
          cellSize={12}
          logoSrc={textMask}
          logoPosition="center"
          logoScale={1}
          enableDripping={false}
          className="w-full h-full"
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
      </div>

      <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
            <Scale className="w-4 h-4" />
            <span className="text-sm font-medium">Organization Documents</span>
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-base mb-6 tracking-tighter">
          Documents
        </h1>
        <p className="text-lg md:text-xl leading-relaxed font-serif max-w-2xl opacity-95">
          Official documents from KTH AI Society: statutes, annual reports, and
          meeting minutes.
        </p>
      </div>
    </section>
  );
}
