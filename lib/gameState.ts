import type { Achievement } from "./achievements";
import { TOKENS, type Alloc } from "./budget";
import type { GQuestion } from "./game";
import { seededShuffle, type Answers } from "./match";
import type { Answer } from "./schema";

// Estat d'una partida, sense React: es desa a sessionStorage i es pot provar amb Vitest.
export type Item = { kind: "q"; q: GQuestion; n: number } | { kind: "pause"; fact: string; n: number };
export type Phase = "intro" | "play" | "priorities" | "counting" | "results";
export type State = {
  v: 3;
  seed: number;
  province: string | null;
  phase: Phase;
  index: number; // posició dins de la baralla (afirmacions + finals de ronda)
  answers: Answers;
  tokens: Record<string, number>; // fitxes d'influència per tema
  alloc: Alloc; // d'on ha sortit el finançament de cada proposta aprovada
  read: string[]; // afirmacions de les quals s'ha llegit el context
  ach: Achievement[];
  back: boolean; // l'últim moviment ha estat enrere
};
export type Action =
  | { type: "province"; id: string }
  | { type: "start" }
  | { type: "vote"; id: string; value: Answer | null; total: number; from?: Record<string, number> }
  | { type: "next"; total: number }
  | { type: "goto"; index: number }
  | { type: "phase"; phase: Phase }
  | { type: "token"; topic: string; delta: 1 | -1 }
  | { type: "read"; id: string }
  | { type: "unlock"; ids: Achievement[] }
  | { type: "restart"; seed: number };

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
export const fresh = (province: string | null): State => ({
  v: 3,
  seed: newSeed(),
  province,
  phase: "intro",
  index: 0,
  answers: {},
  tokens: {},
  alloc: {},
  read: [],
  ach: [],
  back: false,
});
const advance = (s: State, total: number): State =>
  s.index + 1 >= total ? { ...s, phase: "priorities", back: false } : { ...s, index: s.index + 1, back: false };

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "province":
      return { ...s, province: a.id };
    case "start":
      return { ...s, phase: "play", index: 0, back: false };
    case "vote": {
      const alloc = { ...s.alloc };
      if (a.from) alloc[a.id] = a.from;
      else delete alloc[a.id];
      return advance({ ...s, answers: { ...s.answers, [a.id]: a.value }, alloc }, a.total);
    }
    case "next":
      return advance(s, a.total);
    case "goto":
      return { ...s, phase: "play", index: a.index, back: a.index < s.index || s.phase !== "play" };
    case "phase":
      return { ...s, phase: a.phase, back: false };
    case "token": {
      const used = Object.values(s.tokens).reduce((x, y) => x + y, 0);
      const cur = s.tokens[a.topic] ?? 0;
      if ((a.delta > 0 && used >= TOKENS) || (a.delta < 0 && cur === 0)) return s;
      return { ...s, tokens: { ...s.tokens, [a.topic]: cur + a.delta } };
    }
    case "read":
      return s.read.includes(a.id) ? s : { ...s, read: [...s.read, a.id] };
    case "unlock":
      return { ...s, ach: [...s.ach, ...a.ids.filter((x) => !s.ach.includes(x))] };
    case "restart":
      return { ...fresh(s.province), seed: a.seed };
  }
}

export function buildItems(questions: GQuestion[], facts: string[], seed: number): Item[] {
  const order = seededShuffle(questions, seed);
  const stops = order.length >= 12 ? [Math.round(order.length / 3), Math.round((2 * order.length) / 3)] : [];
  return order.flatMap((q, i): Item[] => {
    const k = stops.indexOf(i + 1);
    const card: Item = { kind: "q", q, n: i + 1 };
    return k >= 0 && facts[k] ? [card, { kind: "pause", fact: facts[k], n: i + 1 }] : [card];
  });
}


// Recupera una partida desada (de qualsevol versió). Torna null si no n'hi ha o si ja no quadra amb les dades.
export function restore(raw: unknown, questions: GQuestion[], facts: string[]): State | null {
  type Old = Omit<State, "v" | "tokens" | "alloc" | "read" | "ach"> & { v: 1 | 2; priorities?: string[]; read?: string[]; ach?: Achievement[] };
  const saved = raw as State | Old | null;
  if (!saved || !(saved.v === 1 || saved.v === 2 || saved.v === 3)) return null;
  // Les partides antigues passen els temes ×2 a dues fitxes cadascun.
  const old = saved as Old;
  const st: State =
    saved.v === 3
      ? (saved as State)
      : { read: [], ach: [], ...old, v: 3, alloc: {}, tokens: Object.fromEntries((old.priorities ?? []).map((t) => [t, 2])) };
  // Si les afirmacions han canviat des que es va desar (un desplegament nou), la partida ja no quadra: es comença de nou.
  const ids = new Set(questions.map((q) => q.id));
  const stale = Object.keys(st.answers).some((id) => !ids.has(id)) || st.index >= buildItems(questions, facts, st.seed).length;
  if (stale) return null;
  return st.phase === "counting" ? { ...st, phase: "results" } : st;
}
