"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Scale, ExternalLink } from "lucide-react";
import { AsciiGrid } from "@/components/ui/ascii-grid";

const DOCUMENTS = [
  {
    title: "Statutes",
    slug: "statutes-kth-ai-society-20240915",
    date: "15 Sep 2024",
  },
  {
    title: "Annual Report 2024",
    slug: "annual-report-2024",
    date: "2024",
  },
  {
    title: "Annual Meeting – September 2024",
    slug: "annual-meeting-20240908",
    date: "8 Sep 2024",
  },
  {
    title: "Extraordinary General Meeting – November 2024",
    slug: "extraordinary-general-meeting-20241114",
    date: "14 Nov 2024",
  },
  {
    title: "Annual Meeting – May 2025",
    slug: "annual-meeting-20250517",
    date: "17 May 2025",
  },
  {
    title: "Yearly Meeting 2022",
    slug: "yearly-meeting-2022-signed",
    date: "2022",
  },
];

const BASE_URL = "https://documents.aisociety.se/posts";

export default function DocumentsPage() {
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
    <div className="min-h-screen">
      {/* Header */}
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
            Official documents from KTH AI Society — statutes, annual reports, and meeting minutes.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
          {/* Breadcrumbs */}
          <div className="mb-8 flex items-center">
            <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">
              Home
            </Link>
            <span className="text-gray-300 mx-2">/</span>
            <Link href="/legal" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">
              Legal
            </Link>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-primary font-medium text-sm">Documents</span>
          </div>

          {/* Document list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENTS.map((doc) => (
              <a
                key={doc.slug}
                href={`${BASE_URL}/${doc.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 bg-white rounded-xl border border-secondary-light-gray/60 p-6 hover:shadow-md hover:border-primary/40 transition-all duration-300"
              >
                <div className="shrink-0 w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-arial font-semibold text-secondary-black group-hover:text-primary transition-colors tracking-tight">
                      {doc.title}
                    </h2>
                    <ExternalLink className="w-4 h-4 text-secondary-gray shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="inline-block mt-2 font-mono text-xs text-secondary-gray">
                    {doc.date}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Link to full archive */}
          <div className="mt-8 p-6 bg-white rounded-xl border border-secondary-light-gray/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-arial font-semibold text-secondary-black">Full document archive</p>
              <p className="text-sm text-secondary-black/60 mt-0.5">
                All documents are hosted at documents.aisociety.se
              </p>
            </div>
            <a
              href={BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-mono text-sm text-primary hover:underline underline-offset-4 shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              View all
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
