import type { Answers } from "./match";
import type { Answer } from "./schema";

// Simulador de mandat: el pressupost és limitat. Votar a favor d'una proposta amb cost obliga a dir d'on surten els diners.
export type Alloc = Record<string, Record<string, number>>; // afirmació → font → punts
type Costed = { id: string; budget?: number };
type Source = { id: string; capacity: number };

export const TOKENS = 10; // fitxes d'influència per repartir entre temes
export const weightOf = (tokens: number) => 1 + tokens * 0.5;

const agreed = (a: Answer | null | undefined) => typeof a === "number" && a > 0;

// Saldo: el que aporten les propostes d'ingrés i les fonts, menys el que costen les de despesa.
export function balanceOf(questions: Costed[], answers: Answers, alloc: Alloc, except?: string) {
  let b = 0;
  for (const q of questions) if (q.id !== except && q.budget && agreed(answers[q.id])) b += q.budget;
  for (const [qid, from] of Object.entries(alloc)) if (qid !== except) for (const v of Object.values(from)) b += v;
  return b;
}

export function usedOf(alloc: Alloc, except?: string) {
  const used: Record<string, number> = {};
  for (const [qid, from] of Object.entries(alloc))
    if (qid !== except) for (const [src, v] of Object.entries(from)) used[src] = (used[src] ?? 0) + v;
  return used;
}

// Punts que cal finançar si votes `value` a la proposta `q`, tenint en compte el saldo de la resta.
export function needFor(q: Costed, value: Answer, questions: Costed[], answers: Answers, alloc: Alloc) {
  if (!q.budget || q.budget >= 0 || value <= 0) return 0;
  return Math.max(0, -(balanceOf(questions, answers, alloc, q.id) + q.budget));
}

export const remainingOf = (sources: Source[], alloc: Alloc, except?: string) => {
  const used = usedOf(alloc, except);
  return Object.fromEntries(sources.map((s) => [s.id, s.capacity - (used[s.id] ?? 0)]));
};

// Fer servir una font és estar-hi d'acord: a fons (més de la meitat) compta com a «molt d'acord».
export function fundingAnswers(sources: Source[], alloc: Alloc): Answers {
  const used = usedOf(alloc);
  const out: Answers = {};
  for (const s of sources) if (used[s.id] > 0) out[s.id] = used[s.id] / s.capacity > 0.5 ? 2 : 1;
  return out;
}
