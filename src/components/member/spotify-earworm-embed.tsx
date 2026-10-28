"use client";

import { toSpotifyEmbedUrl } from "@/lib/spotify-earworm";

interface SpotifyEarwormEmbedProps {
  url: string;
  label?: string;
  /** Compact height for sidebar / form preview */
  compact?: boolean;
}

export function SpotifyEarwormEmbed({
  url,
  label,
  compact = false,
}: SpotifyEarwormEmbedProps) {
  const embedUrl = toSpotifyEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-xs font-mono uppercase tracking-widest text-secondary-gray">
          {label}
        </p>
      ) : null}
      <div
        className={
          compact
            ? "overflow-hidden rounded-xl border border-secondary-light-gray/60 bg-white"
            : "overflow-hidden rounded-2xl border border-secondary-light-gray/60 bg-white shadow-sm"
        }
      >
        <iframe
          title={label ? `Spotify: ${label}` : "Spotify earworm"}
          src={embedUrl}
          width="100%"
          height={compact ? 80 : 152}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="block w-full border-0"
        />
      </div>
    </div>
  );
}
