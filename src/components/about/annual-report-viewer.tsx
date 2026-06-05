"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const PDF_URL = "/kth-ais-annual-report.pdf";

export function AnnualReportViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      setPageWidth(Math.max(node.clientWidth - 32, 280));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setIsLoading(false);
    setError("Could not load the annual report.");
  }, []);

  return (
    <div
      ref={containerRef}
      className="max-h-[70vh] min-h-[480px] overflow-y-auto"
    >
      {isLoading && !error && (
        <div className="flex items-center justify-center py-16">
          <p className="font-mono text-secondary-gray text-sm">Loading report...</p>
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-center py-16">
          <p className="font-mono text-secondary-gray text-sm">{error}</p>
        </div>
      ) : (
        <Document
          file={PDF_URL}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          className="flex flex-col items-center gap-4 py-4"
        >
          {Array.from({ length: numPages }, (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-md bg-white"
            />
          ))}
        </Document>
      )}
    </div>
  );
}
