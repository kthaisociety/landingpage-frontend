"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ProfileSong } from "@/lib/profile-touches";

export function SongSearch({ id, onSelect }: { id?: string; onSelect: (song: ProfileSong) => void }) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const open = !dismissed && query.trim().length >= 2;

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/songs?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then(async (res) => (res.ok ? ((await res.json()) as { results?: ProfileSong[] }) : { results: [] }))
        .then((data) => {
          if (cancelled) return;
          setResults(data.results ?? []);
          setActive(0);
        })
        .catch((err: unknown) => {
          if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
          setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setDismissed(true);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function choose(song: ProfileSong) {
    onSelect(song);
    setQuery("");
    setResults([]);
    setDismissed(true);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setDismissed(true);
      return;
    }
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const song = results[active];
      if (song) choose(song);
    }
  }

  return (
    <div ref={rootRef} className="relative z-30 w-full max-w-sm">
      <Input
        id={id}
        value={query}
        onChange={(event) => {
          const { value } = event.target;
          setQuery(value);
          setDismissed(false);
          setLoading(value.trim().length >= 2);
        }}
        onFocus={() => setDismissed(false)}
        onKeyDown={onKeyDown}
        placeholder="Search for a song or artist"
        aria-label="Search for a song or artist"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${listId}-${results[active].id}` : undefined}
        autoComplete="off"
        spellCheck={false}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
        >
          {loading && results.length === 0 ? (
            <li className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-gray">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching
            </li>
          ) : null}
          {!loading && results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-secondary-gray">No songs found</li>
          ) : null}
          {results.map((song, index) => (
            <li key={song.id} id={`${listId}-${song.id}`} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${index === active ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(song)}
              >
                {song.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- album art from the search result
                  <img src={song.image} alt="" className="size-10 shrink-0 rounded-sm object-cover" />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-secondary-gray">
                    <Music className="h-4 w-4" aria-hidden />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-secondary-black">{song.title}</span>
                  {song.artist ? <span className="block truncate text-xs text-secondary-gray">{song.artist}</span> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
