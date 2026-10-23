"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { useSponsors, sponsorLogoUrl, type Sponsor } from "@/hooks/sponsors";

const SKELETON_KEYS = ["first", "second", "third", "fourth"];

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const logo = (
    <div className="relative aspect-[3/2] w-full">
      <Image
        src={sponsorLogoUrl(sponsor)}
        alt={`${sponsor.name} logo`}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-contain p-6"
        unoptimized
      />
    </div>
  );

  const cardClass =
    "block rounded-2xl border bg-white transition-shadow hover:shadow-md";

  if (!sponsor.websiteUrl) {
    return <div className={cardClass}>{logo}</div>;
  }
  return (
    <a
      href={sponsor.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${sponsor.name} (opens in a new tab)`}
      className={cardClass}
    >
      {logo}
    </a>
  );
}

export function SponsorsPage() {
  const [textMask, setTextMask] = useState<string | undefined>(undefined);
  const { data: sponsors, isLoading, isError } = useSponsors();

  // AsciiGrid text mask
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("SPONSORS", 50, 50);

    const dataUrl = canvas.toDataURL("image/png");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTextMask(dataUrl);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={textMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-times font-normal text-primary">(Our)</span>{" "}
            Sponsors
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Sponsors</h1>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 pb-24">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 lg:p-12 shadow-lg border">
          <div className="flex flex-col gap-4 mb-12">
            <div>
              <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">Home</Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-primary font-medium text-sm">Sponsors</span>
            </div>

            {/* ---- PLACEHOLDER ---- */}
            <p className="text-lg md:text-xl max-w-3xl opacity-95 leading-relaxed font-serif text-secondary-black mt-2">
              These companies support KTH AI Society with services and resources that help us run our events, projects and infrastructure.
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {SKELETON_KEYS.map((key) => (
                <Skeleton key={key} className="aspect-[3/2] w-full rounded-2xl" />
              ))}
            </div>
          )}

          {isError && (
            <p className="font-arial text-secondary-black/70">
              We couldn&apos;t load our sponsors right now. Please try again later.
            </p>
          )}

          {sponsors && sponsors.length === 0 && (
            <p className="font-arial text-secondary-black/70">
              No sponsors to show yet.
            </p>
          )}

          {sponsors && sponsors.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sponsors.map((sponsor) => (
                <li key={sponsor.id}>
                  <SponsorLogo sponsor={sponsor} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
