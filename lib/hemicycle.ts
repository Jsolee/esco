export type Seat = { x: number; y: number; a: number; row: number };

// Seients d'un hemicicle en files concèntriques, ordenats d'esquerra a dreta. x ∈ [−1, 1], y ∈ [0, 1].
export function hemicycle(n = 350, rows = 10, inner = 0.42): Seat[] {
  const radii = Array.from({ length: rows }, (_, i) => inner + ((1 - inner) * i) / (rows - 1));
  const total = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.floor((n * r) / total));
  for (let i = rows - 1, rest = n - counts.reduce((a, b) => a + b, 0); rest > 0; i--, rest--) counts[i]++;
  const seats: Seat[] = [];
  radii.forEach((r, row) => {
    const k = counts[row];
    for (let j = 0; j < k; j++) {
      const a = Math.PI * (1 - j / (k - 1));
      seats.push({ x: r * Math.cos(a), y: r * Math.sin(a), a, row });
    }
  });
  return seats.sort((s, t) => t.a - s.a || s.row - t.row);
}

// Ordre d'encesa del progrés: una falca que creix des del centre cap als dos costats, simètrica.
export const fillOrder = (seats: Seat[]) =>
  seats.map((s, i) => ({ i, d: Math.abs(s.a - Math.PI / 2), row: s.row })).sort((p, q) => p.d - q.d || p.row - q.row).map((p) => p.i);

export const SEATS = hemicycle();
export const FILL = fillOrder(SEATS);
// RANK[seient] = posició del seient dins l'ordre d'encesa
export const RANK = FILL.reduce<number[]>((acc, seat, k) => ((acc[seat] = k), acc), []);
