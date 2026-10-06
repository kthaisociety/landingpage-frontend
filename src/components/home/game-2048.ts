export type Direction = "up" | "down" | "left" | "right";

export function slideBoard(board: number[], direction: Direction) {
  const next = Array<number>(16).fill(0);
  let points = 0;
  const movements: { from: number; to: number }[] = [];

  for (let line = 0; line < 4; line += 1) {
    const indices = Array.from({ length: 4 }, (_, offset) => {
      switch (direction) {
        case "left": return line * 4 + offset;
        case "right": return line * 4 + 3 - offset;
        case "up": return offset * 4 + line;
        case "down": return (3 - offset) * 4 + line;
      }
    });
    const occupied = indices.filter((index) => board[index] !== 0);
    const values = occupied.map((index) => board[index]);
    const merged: number[] = [];
    for (let i = 0; i < values.length; i += 1) {
      const to = indices[merged.length];
      movements.push({ from: occupied[i], to });
      if (values[i] === values[i + 1]) {
        movements.push({ from: occupied[i + 1], to });
        const value = values[i] * 2;
        merged.push(value);
        points += value;
        i += 1;
      } else {
        merged.push(values[i]);
      }
    }
    indices.forEach((index, offset) => { next[index] = merged[offset] ?? 0; });
  }

  return { board: next, points, movements, changed: next.some((value, index) => value !== board[index]) };
}

export function spawnTile(board: number[]) {
  const empty = board.flatMap((value, index) => value === 0 ? [index] : []);
  if (!empty.length) return board;
  const next = [...board];
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

export function hasMoves(board: number[]) {
  return board.some((value, index) => value === 0
    || (index % 4 < 3 && value === board[index + 1])
    || (index < 12 && value === board[index + 4]));
}
