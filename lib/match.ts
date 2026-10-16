import type { Answer, Axis, Question } from "./schema";

// Tipus estructurals: serveixen tant per a les dades validades com per a les que arriben al client.
type MQuestion = Pick<Question, "id" | "topic" | "axes">;
type MCandidacy = { id: string; circumscriptions?: "all" | string[]; positions: Record<string, { value: number | null } | undefined> };

export const MIN_COVERAGE = 0.5;
export const AXES: Axis[] = ["economic", "social", "territorial"];

export type Answers = Record<string, Answer | null>; // null = saltada; absent = encara no vista
export type Point = Partial<Record<Axis, number>>;
export type Ranked = { id: string; affinity: number; rank: number; coverage: number };
export type Insufficient = { id: string; coverage: number };

export function match(input: {
  questions: MQuestion[];
  answers: Answers;
  priorities: string[]; // temes amb pes ×2
  candidacies: MCandidacy[]; // ja filtrades per circumscripció
  order: string[]; // ordre aleatori de la sessió: desfà empats sense afavorir ningú
}): { ranked: Ranked[]; insufficient: Insufficient[]; user: Point } {
  const { questions, answers, candidacies, order } = input;
  const prio = new Set(input.priorities);
  const answered = questions.filter((q) => typeof answers[q.id] === "number");
  const pos = (id: string) => (order.indexOf(id) + 1 || Infinity);

  const scored: Omit<Ranked, "rank">[] = [];
  const insufficient: Insufficient[] = [];
  for (const c of candidacies) {
    let distance = 0;
    let max = 0;
    let n = 0;
    for (const q of answered) {
      const v = c.positions[q.id]?.value;
      if (v === null || v === undefined) continue;
      const w = prio.has(q.topic) ? 2 : 1;
      distance += w * Math.abs((answers[q.id] as number) - v);
      max += w * 4;
      n++;
    }
    const coverage = answered.length ? n / answered.length : 0;
    if (n === 0 || coverage < MIN_COVERAGE) insufficient.push({ id: c.id, coverage });
    else scored.push({ id: c.id, affinity: Math.round(100 * (1 - distance / max)), coverage });
  }

  // Els empats es decideixen sobre la xifra arrodonida, la que es veu.
  scored.sort((a, b) => b.affinity - a.affinity || pos(a.id) - pos(b.id));
  insufficient.sort((a, b) => pos(a.id) - pos(b.id));
  const ranked = scored.map((s) => ({ ...s, rank: 1 + scored.filter((o) => o.affinity > s.affinity).length }));

  return { ranked, insufficient, user: axesOf(questions, answers) };
}

// Posició a cada eix, de −1 a +1. Si minCoverage > 0, un eix només es dona quan hi ha valor
// per a aquesta fracció de les afirmacions que hi contribueixen.
export function axesOf(
  questions: Pick<Question, "id" | "axes">[],
  values: Record<string, number | null | undefined>,
  minCoverage = 0,
): Point {
  const out: Point = {};
  for (const axis of AXES) {
    let num = 0;
    let den = 0;
    let total = 0;
    let seen = 0;
    for (const q of questions) {
      const c = q.axes[axis];
      if (!c) continue;
      total++;
      const v = values[q.id];
      if (typeof v !== "number") continue;
      seen++;
      num += c * v;
      den += Math.abs(c) * 2;
    }
    if (den && seen / total >= minCoverage) out[axis] = num / den;
  }
  return out;
}

export const positionsOf = (c: MCandidacy) =>
  Object.fromEntries(Object.entries(c.positions).map(([k, p]) => [k, p?.value ?? null]));

export const inCircumscription = (c: { circumscriptions: "all" | string[] }, province: string) =>
  c.circumscriptions === "all" || c.circumscriptions.includes(province);

// mulberry32 + Fisher–Yates: el mateix seed sempre dona el mateix ordre.
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Repartiment D'Hondt. Els empats van a qui surt abans a `votes`.
export function dhondt(votes: { id: string; votes: number }[], seats: number): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(votes.map((v) => [v.id, 0]));
  for (let s = 0; s < seats; s++) {
    let best = -1;
    let bestQ = -1;
    votes.forEach((v, i) => {
      const q = v.votes / (out[v.id] + 1);
      if (q > bestQ) [best, bestQ] = [i, q];
    });
    if (best < 0 || bestQ <= 0) break;
    out[votes[best].id]++;
  }
  return out;
}
