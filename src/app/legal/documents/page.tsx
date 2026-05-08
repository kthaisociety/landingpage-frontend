import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";
import { DocumentsHero } from "./documents-hero";

type DocumentEntry = {
  title: string;
  url: string;
  date: string;
};

const DOCUMENTS_FEED_URL = "https://documents.aisociety.se/index.xml";
const POSTS_ARCHIVE_URL = "https://documents.aisociety.se/posts";
const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatPubDate(rawDate: string): string {
  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return rawDate;
  }

  return DATE_FORMATTER.format(parsedDate);
}

function parseRssDocuments(xml: string): DocumentEntry[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
  const descriptionRegex = /<description>([\s\S]*?)<\/description>/;
  const documentUrlRegex =
    /https:\/\/documents\.aisociety\.se\/uploads\/[^"&<\s]+\.pdf/i;

  const documents: DocumentEntry[] = [];

  for (const itemMatch of xml.matchAll(itemRegex)) {
    const [, item] = itemMatch;
    const title = item.match(titleRegex)?.[1]?.trim();
    const pubDate = item.match(pubDateRegex)?.[1]?.trim();
    const description = item.match(descriptionRegex)?.[1] ?? "";
    const documentUrl = description.match(documentUrlRegex)?.[0];

    if (title && pubDate && documentUrl) {
      documents.push({
        title,
        url: documentUrl,
        date: formatPubDate(pubDate),
      });
    }
  }

  return documents;
}

async function getDocuments(): Promise<{
  documents: DocumentEntry[];
  hasError: boolean;
}> {
  try {
    const response = await fetch(DOCUMENTS_FEED_URL, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { documents: [], hasError: true };
    }

    const xml = await response.text();
    const documents = parseRssDocuments(xml);

    if (documents.length === 0) {
      return { documents: [], hasError: true };
    }

    return { documents, hasError: false };
  } catch {
    return { documents: [], hasError: true };
  }
}

export default async function DocumentsPage() {
  const { documents, hasError } = await getDocuments();

  return (
    <div className="min-h-screen">
      <DocumentsHero />

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
          {/* Breadcrumbs */}
          <div className="mb-8 flex items-center">
            <Link
              href="/"
              className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <span className="text-gray-300 mx-2">/</span>
            <Link
              href="/legal"
              className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium"
            >
              Legal
            </Link>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-primary font-medium text-sm">Documents</span>
          </div>

          {/* Document list */}
          {hasError ? (
            <div className="bg-white rounded-xl border border-secondary-light-gray/60 p-6">
              <h2 className="font-arial font-semibold text-secondary-black">
                Something went wrong while loading documents
              </h2>
              <p className="text-sm text-secondary-black/70 mt-2">
                You can still browse all documents directly at{" "}
                <a
                  href={POSTS_ARCHIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-4"
                >
                  documents.aisociety.se/posts
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <a
                  key={doc.url}
                  href={doc.url}
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
          )}

          {/* Link to full archive */}
          <div className="mt-8 p-6 bg-white rounded-xl border border-secondary-light-gray/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-arial font-semibold text-secondary-black">
                Full document archive
              </p>
              <p className="text-sm text-secondary-black/60 mt-0.5">
                All documents are hosted at documents.aisociety.se
              </p>
            </div>
            <a
              href={POSTS_ARCHIVE_URL}
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
