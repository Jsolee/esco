import { RED_LINES, type Answers } from "./match";
import type { Answer } from "./schema";

// Respostes desades per veure les candidatures quan s'obri l'elecció (mode brúixola).
// Viuen a localStorage d'aquest dispositiu o en un enllaç privat; no surten mai cap a cap servidor.
export type Saved = {
  province: string | null;
  answers: Answers;
  tokens: Record<string, number>;
  red?: string[]; // línies vermelles
};

const KEY = (election: string) => `esco-desat:${election}`;

export function loadSaved(election: string, questionIds: string[], topicIds: string[]): Saved | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY(election)) ?? "null") as Saved | null;
    return raw ? clean(raw, questionIds, topicIds) : null;
  } catch {
    return null;
  }
}

export function storeSaved(election: string, saved: Saved) {
  try {
    localStorage.setItem(KEY(election), JSON.stringify(saved));
  } catch {}
}

export function clearSaved(election: string) {
  try {
    localStorage.removeItem(KEY(election));
  } catch {}
}

// Les afirmacions que ja no existeixen es descarten; si no en queda cap de votada, no hi ha res a recuperar.
export function clean(saved: Saved, questionIds: string[], topicIds: string[]): Saved | null {
  const answers: Answers = {};
  for (const id of questionIds) {
    const a = saved.answers?.[id];
    if (a === null || (typeof a === "number" && Number.isInteger(a) && a >= -2 && a <= 2)) answers[id] = a as Answer | null;
  }
  if (!Object.values(answers).some((a) => typeof a === "number")) return null;
  const tokens: Record<string, number> = {};
  for (const t of topicIds) {
    const n = saved.tokens?.[t];
    if (typeof n === "number" && Number.isInteger(n) && n > 0) tokens[t] = n;
  }
  const province = typeof saved.province === "string" && /^\d{2}$/.test(saved.province) ? saved.province : null;
  const red = (Array.isArray(saved.red) ? saved.red : []).filter((id) => typeof answers[id] === "number" && answers[id] !== 0).slice(0, RED_LINES);
  return { province, answers, tokens, red };
}

// Enllaç privat: «1-<província>-<respostes>-<fitxes>». Cada resposta és «hash de 2 caràcters de l'id + valor»,
// de manera que si una afirmació canvia d'id només es perd aquella resposta. El valor en majúscula és una línia vermella.
const VALUE = "sabcde"; // s = saltada, a..e = −2..+2
const hash2 = (id: string) => {
  let h = 0x811c9dc5;
  for (const ch of id) h = Math.imul(h ^ ch.codePointAt(0)!, 0x01000193) >>> 0;
  return (h % 1296).toString(36).padStart(2, "0");
};

export function encodeSaved(saved: Saved, questionIds: string[], topicIds: string[]): string {
  const answers = questionIds
    .filter((id) => saved.answers[id] !== undefined)
    .map((id) => {
      const ch = VALUE[saved.answers[id] === null ? 0 : (saved.answers[id] as number) + 3];
      return hash2(id) + (saved.red?.includes(id) ? ch.toUpperCase() : ch);
    })
    .join("");
  const tokens = topicIds
    .filter((t) => (saved.tokens[t] ?? 0) > 0)
    .map((t) => hash2(t) + Math.min(saved.tokens[t], 35).toString(36))
    .join("");
  return ["1", saved.province ?? "xx", answers, tokens].join("-");
}

export function decodeSaved(code: string, questionIds: string[], topicIds: string[]): Saved | null {
  const m = /^1-(\d{2}|xx)-((?:[0-9a-z]{2}[sabcdeABDE])*)-((?:[0-9a-z]{3})*)$/.exec(code);
  if (!m) return null;
  const byHash = (ids: string[]) => {
    const map = new Map<string, string>();
    const dup = new Set<string>();
    for (const id of ids) {
      if (map.has(hash2(id))) dup.add(hash2(id));
      else map.set(hash2(id), id);
    }
    dup.forEach((h) => map.delete(h)); // dos ids amb el mateix hash: millor perdre la resposta que assignar-la malament
    return map;
  };
  const qs = byHash(questionIds);
  const ts = byHash(topicIds);
  const answers: Answers = {};
  const red: string[] = [];
  for (let i = 0; i < m[2].length; i += 3) {
    const id = qs.get(m[2].slice(i, i + 2));
    const ch = m[2][i + 2];
    const v = VALUE.indexOf(ch.toLowerCase());
    if (!id) continue;
    answers[id] = v === 0 ? null : ((v - 3) as Answer);
    if (ch !== ch.toLowerCase()) red.push(id);
  }
  const tokens: Record<string, number> = {};
  for (let i = 0; i < m[3].length; i += 3) {
    const id = ts.get(m[3].slice(i, i + 2));
    if (id) tokens[id] = parseInt(m[3][i + 2], 36);
  }
  return clean({ province: m[1] === "xx" ? null : m[1], answers, tokens, red }, questionIds, topicIds);
}

export const LINK_PREFIX = "#respostes=";
