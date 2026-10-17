import { describe, expect, it } from "vitest";
import { achievementsOf, progressOf } from "./achievements";
import { TOKENS } from "./budget";
import type { GQuestion } from "./game";
import type { Answers } from "./match";
import { buildItems, fresh, fromSaved, reducer, restore, type State } from "./gameState";

const qs: GQuestion[] = Array.from({ length: 24 }, (_, i) => ({ id: `q${i}`, topic: `t${i % 8}`, text: "", context: "", axes: {} }));
const facts = ["f1", "f2", "f3"];
const items = buildItems(qs, facts, 7);
const total = items.length;
const playing = (): State => ({ ...fresh("08"), seed: 7, phase: "play" });

describe("baralla", () => {
  it("té totes les afirmacions una vegada i dues pauses entre rondes", () => {
    const cards = items.filter((it) => it.kind === "q");
    expect(new Set(cards.map((it) => it.kind === "q" && it.q.id)).size).toBe(24);
    expect(items.filter((it) => it.kind === "pause").map((it) => it.n)).toEqual([8, 16]);
    expect(total).toBe(26);
  });

  it("depèn de la llavor de la sessió", () => {
    expect(buildItems(qs, facts, 7)).toEqual(items);
    expect(buildItems(qs, facts, 8)).not.toEqual(items);
  });

  it("no fa pauses si hi ha poques afirmacions o no hi ha dades curioses", () => {
    expect(buildItems(qs.slice(0, 6), facts, 1).every((it) => it.kind === "q")).toBe(true);
    expect(buildItems(qs, [], 1).every((it) => it.kind === "q")).toBe(true);
  });
});

describe("partida", () => {
  it("votar desa la resposta i avança; l'última carta porta a les fitxes", () => {
    let s = reducer(playing(), { type: "vote", id: "q0", value: 2, total });
    expect(s.answers.q0).toBe(2);
    expect(s.index).toBe(1);
    s = reducer({ ...s, index: total - 1 }, { type: "vote", id: "q1", value: null, total });
    expect(s.phase).toBe("priorities");
    expect(s.index).toBe(total - 1);
  });

  it("desfer (anar enrere) marca el moviment com a enrere", () => {
    const s = reducer({ ...playing(), index: 3 }, { type: "goto", index: 2 });
    expect(s).toMatchObject({ index: 2, back: true, phase: "play" });
  });

  it("guarda d'on surt el finançament i l'esborra si es torna a votar sense", () => {
    let s = reducer(playing(), { type: "vote", id: "q0", value: 1, total, from: { "imp-irpf": 4 } });
    expect(s.alloc.q0).toEqual({ "imp-irpf": 4 });
    s = reducer({ ...s, index: 0 }, { type: "vote", id: "q0", value: null, total });
    expect(s.alloc.q0).toBeUndefined();
  });

  it("no deixa repartir més fitxes de les que hi ha ni treure'n d'on no n'hi ha", () => {
    let s = playing();
    for (let i = 0; i < TOKENS + 3; i++) s = reducer(s, { type: "token", topic: "t0", delta: 1 });
    expect(s.tokens.t0).toBe(TOKENS);
    s = reducer(s, { type: "token", topic: "t1", delta: -1 });
    expect(s.tokens.t1).toBeUndefined();
  });

  it("canviar una resposta des del repàs no avança i esborra el finançament d'aquella proposta", () => {
    const s0 = { ...playing(), phase: "results" as const, index: total - 1, answers: { q0: 2 as const }, alloc: { q0: { deute: 3 } } };
    const s = reducer(s0, { type: "answer", id: "q0", value: -1 });
    expect(s).toMatchObject({ phase: "results", index: total - 1, answers: { q0: -1 }, alloc: {} });
  });

  it("una partida desada torna directament als resultats i és vàlida", () => {
    const s = fromSaved({ province: "08", answers: { q0: 1, q1: null }, tokens: { t0: 2 } }, qs, facts);
    expect(s).toMatchObject({ phase: "results", province: "08", answers: { q0: 1, q1: null }, tokens: { t0: 2 } });
    expect(restore(s, qs, facts)).toEqual(s);
  });

  it("les línies vermelles: només amb sí o no, com a màxim tres, i es treuen si la resposta passa a abstenció", () => {
    let s = playing();
    s = reducer(s, { type: "vote", id: "q0", value: 0, total, red: true });
    expect(s.red).toEqual([]);
    for (const id of ["q1", "q2", "q3", "q4"]) s = reducer({ ...s, index: 0 }, { type: "vote", id, value: 1, total, red: true });
    expect(s.red).toEqual(["q1", "q2", "q3"]);
    s = reducer(s, { type: "answer", id: "q2", value: 0 });
    expect(s.red).toEqual(["q1", "q3"]);
    s = reducer(s, { type: "red", id: "q4" });
    expect(s.red).toEqual(["q1", "q3", "q4"]);
    s = reducer(s, { type: "red", id: "q1" });
    expect(s.red).toEqual(["q3", "q4"]);
  });

  it("tornar a jugar conserva la província i res més", () => {
    const s = reducer({ ...playing(), answers: { q0: 1 }, tokens: { t0: 2 } }, { type: "restart", seed: 99 });
    expect(s).toMatchObject({ province: "08", seed: 99, phase: "intro", answers: {}, tokens: {} });
  });
});

describe("restaurar la partida", () => {
  it("recupera una partida vàlida i passa del recompte als resultats", () => {
    const saved = { ...playing(), answers: { q0: 1 }, index: 1 };
    expect(restore(saved, qs, facts)).toEqual(saved);
    expect(restore({ ...saved, phase: "counting" }, qs, facts)?.phase).toBe("results");
  });

  it("converteix els temes ×2 de les versions antigues en dues fitxes", () => {
    const { tokens, alloc, read, ach, ...rest } = playing();
    void [tokens, alloc, read, ach];
    const r = restore({ ...rest, v: 2, priorities: ["t0", "t3"] }, qs, facts);
    expect(r?.tokens).toEqual({ t0: 2, t3: 2 });
    expect(r?.v).toBe(3);
  });

  it("descarta el que no quadra amb les dades actuals", () => {
    expect(restore(null, qs, facts)).toBeNull();
    expect(restore({ v: 9 }, qs, facts)).toBeNull();
    expect(restore({ ...playing(), answers: { esborrada: 1 } }, qs, facts)).toBeNull();
    expect(restore({ ...playing(), index: total }, qs, facts)).toBeNull();
    expect(restore({ ...playing(), index: total - 1 }, qs, facts)).not.toBeNull();
  });
});

describe("assoliments", () => {
  const order = qs.map((q) => q.id);
  const answered = (n: number, skipAt?: number): Answers =>
    Object.fromEntries(order.slice(0, n).map((id, i) => [id, i === skipAt ? null : 1]));

  it("compten la ratxa fins a la primera carta sense votar i la reinicien en saltar", () => {
    expect(progressOf(order, answered(6))).toEqual({ run: 6, best: 6, voted: 6, skipped: 0 });
    expect(progressOf(order, answered(6, 2))).toEqual({ run: 3, best: 3, voted: 5, skipped: 1 });
  });

  it("depenen de com jugues, no de què respons", () => {
    const yes = achievementsOf(order, answered(24), 8, true);
    const no = achievementsOf(order, Object.fromEntries(order.map((id) => [id, -2])) as Answers, 8, true);
    expect(yes).toEqual(no);
    expect(yes).toEqual(["first", "streak5", "streak10", "curious", "informed", "full"]);
  });

  it("«full» només si s'acaba sense saltar-ne cap", () => {
    expect(achievementsOf(order, answered(24, 5), 0, true)).not.toContain("full");
    expect(achievementsOf(order, answered(24), 0, false)).not.toContain("full");
  });
});
