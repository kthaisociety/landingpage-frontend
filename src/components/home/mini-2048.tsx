"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { hasMoves, slideBoard, spawnTile, type Direction } from "./game-2048";
import styles from "./mini-2048.module.css";

const INITIAL_BOARD = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0];
const CELLS = Array.from({ length: 16 }, (_, index) => ({ id: `cell-${index}`, index }));
type Tile = { id: number; index: number; value: number; effect?: "spawn" | "merge" };
const INITIAL_TILES: Tile[] = [{ id: 0, index: 0, value: 2 }, { id: 1, index: 10, value: 2 }];
const KEYS: Record<string, Direction> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
};
const TILE_COLORS: Record<number, string> = {
  2: "bg-blue-100 text-blue-950", 4: "bg-blue-200 text-blue-950",
  8: "bg-blue-300 text-blue-950", 16: "bg-blue-400 text-blue-950",
  32: "bg-blue-600 text-white", 64: "bg-primary text-white",
  128: "bg-blue-800 text-white", 256: "bg-blue-900 text-white",
  512: "bg-indigo-700 text-white", 1024: "bg-indigo-800 text-white",
  2048: "bg-indigo-950 text-white",
};
const CONTROL_CLASS = "flex size-11 items-center justify-center rounded-lg border border-blue-200 bg-white text-xl text-primary hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function Mini2048() {
  const [game, setGame] = useState({ board: INITIAL_BOARD, score: 0, best: 0 });
  const [tiles, setTiles] = useState(INITIAL_TILES);
  const nextId = useRef(2);
  const moving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const boardRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const over = !hasMoves(game.board);
  const won = game.board.some((value) => value >= 2048);

  function allocateId() {
    const id = nextId.current;
    nextId.current += 1;
    return id;
  }

  function move(direction: Direction) {
    if (over || moving.current) return;
    const result = slideBoard(game.board, direction);
    if (!result.changed) return;
    const score = game.score + result.points;
    const board = spawnTile(result.board);
    const destinations = new Map(result.movements.map(({ from, to }) => [from, to]));
    const settled: Tile[] = [];
    for (const { from, to } of result.movements) {
      if (!settled.some((tile) => tile.index === to)) {
        const original = tiles.find((tile) => tile.index === from)!;
        settled.push({ id: original.id, index: to, value: result.board[to], effect: result.board[to] !== original.value ? "merge" : undefined });
      }
    }
    const spawned = board.findIndex((value, index) => value !== result.board[index]);
    if (spawned >= 0) settled.push({ id: allocateId(), index: spawned, value: board[spawned], effect: "spawn" });
    moving.current = true;
    setTiles(tiles.map((tile) => ({ ...tile, index: destinations.get(tile.index) ?? tile.index, effect: undefined })));
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 150;
    timer.current = setTimeout(() => {
      setTiles(settled);
      setGame({ board, score, best: Math.max(game.best, score) });
      moving.current = false;
      timer.current = null;
    }, duration);
  }

  function restart() {
    if (timer.current) clearTimeout(timer.current);
    moving.current = false;
    timer.current = null;
    const board = spawnTile(spawnTile(Array<number>(16).fill(0)));
    setGame({ board, score: 0, best: game.best });
    setTiles(board.flatMap((value, index) => value ? [{ id: allocateId(), index, value, effect: "spawn" as const }] : []));
    boardRef.current?.focus({ preventScroll: true });
  }

  return (
    <section aria-labelledby="mini-2048-title" className="border-t border-black/5 bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 sm:flex-row sm:gap-16">
        <div className="max-w-xs flex-1">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary">A LITTLE BRAIN BREAK</p>
          <h2 id="mini-2048-title" className="text-5xl font-semibold tracking-tight"><span className="font-times font-normal text-primary">(2048)</span></h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">Slide the tiles. Merge matching numbers. Can you reach 2048?</p>
          <p id="mini-2048-help" className="mt-4 text-xs leading-5 text-slate-600">Click or focus the board and use your arrow keys. On mobile, swipe or use the buttons below.</p>
        </div>
        <div className="w-full max-w-[340px] shrink-0 rounded-2xl border border-black/5 bg-slate-50 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex gap-4 text-primary">
              <div><p className="text-[10px] font-semibold uppercase tracking-widest">Score</p><p className="font-mono text-lg tabular-nums">{game.score}</p></div>
              <div><p className="text-[10px] font-semibold uppercase tracking-widest">Session best</p><p className="font-mono text-lg tabular-nums">{game.best}</p></div>
            </div>
            <button type="button" onClick={restart} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">New game</button>
          </div>
          <div
            ref={boardRef}
            role="group"
            aria-label="2048 game board"
            aria-describedby="mini-2048-help"
            tabIndex={0}
            className="touch-none rounded-xl bg-slate-200/70 p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
            onKeyDown={(event) => {
              const direction = KEYS[event.key];
              if (direction && !event.altKey && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                move(direction);
              }
            }}
            onPointerDown={(event) => {
              if (!event.isPrimary) return;
              event.currentTarget.focus({ preventScroll: true });
              event.currentTarget.setPointerCapture(event.pointerId);
              swipe.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerCancel={() => { swipe.current = null; }}
            onPointerUp={(event) => {
              if (!swipe.current) return;
              const dx = event.clientX - swipe.current.x;
              const dy = event.clientY - swipe.current.y;
              swipe.current = null;
              if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
              move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
            }}
          >
            <div className={styles.board}>
              <div className="grid grid-cols-4 gap-2" aria-hidden="true">
                {CELLS.map(({ id }) => <div key={id} className="aspect-square rounded-md bg-white/65" />)}
              </div>
              {tiles.map((tile) => (
                <div key={tile.id} className={styles.tile} style={{ "--column": tile.index % 4, "--row": Math.floor(tile.index / 4) } as CSSProperties}>
                  <div aria-label={`Row ${Math.floor(tile.index / 4) + 1}, column ${tile.index % 4 + 1}: ${tile.value}`} className={`${styles.face} ${tile.effect === "spawn" ? styles.spawn : tile.effect === "merge" ? styles.merge : ""} ${tile.value >= 1024 ? "text-lg" : "text-2xl"} ${TILE_COLORS[tile.value] ?? "bg-indigo-950 text-white"}`}>
                    {tile.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p role="status" aria-live="polite" className="mt-3 min-h-10 text-center text-xs leading-5 text-slate-600">
            {over ? `Game over! Final score: ${game.score}. Start a new game to try again.` : won ? "You reached 2048! Keep going for a higher score." : "Merge two matching tiles to add to your score."}
          </p>
          <div aria-label="Game controls" className="flex justify-center gap-2">
            {([['left', '←'], ['up', '↑'], ['down', '↓'], ['right', '→']] as const).map(([direction, arrow]) => (
              <button key={direction} type="button" aria-label={`Move ${direction}`} disabled={over} onClick={() => move(direction)} className={`${CONTROL_CLASS} disabled:opacity-40`}>{arrow}</button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
