import type { Point } from "./match";
import type { Axis } from "./schema";

// Nivell d'una posició en un eix (−1..+1) per explicar-la amb paraules.
export type Level = "center" | "neg1" | "neg2" | "pos1" | "pos2";
export const level = (v: number): Level =>
  Math.abs(v) < 0.15 ? "center" : v < 0 ? (v < -0.45 ? "neg2" : "neg1") : v > 0.45 ? "pos2" : "pos1";

// «En economia ets al centre-esquerra; en temes socials, …; i en el model territorial, …»
export const sentenceOf = (point: Point, axes: Axis[], levels: Record<Axis, Record<Level, string>>) =>
  axes
    .filter((a) => point[a] !== undefined)
    .map((a) => levels[a][level(point[a]!)])
    .join("; ");
