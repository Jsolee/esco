import { describe, expect, it } from "vitest";
import { axesOf, dhondt, match, MIN_COVERAGE, seededShuffle } from "./match";
import type { Answer, Candidacy, Question } from "./schema";

const q = (id: string, topic = "t1", axes: Question["axes"] = { economic: 1 }): Question => ({
  id,
  topic,
  text: { ca: id, es: id },
  context: { ca: "c", es: "c" },
  axes,
});

const party = (id: string, values: Record<string, Answer | null>): Candidacy => ({
  id,
  name: id,
  short: id,
  color: "#000000",
  provisional: false,
  circumscriptions: "all",
  sources: [{ id: "p", title: "p", url: "https://example.org", date: "2027-01-01", lang: "ca" }],
  positions: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { value: v, source: "p", page: 1 }])),
});

const Q = [q("a"), q("b"), q("c"), q("d", "t2")];
const run = (answers: Record<string, Answer | null>, candidacies: Candidacy[], weights: Record<string, number> = {}, order?: string[]) =>
  match({ questions: Q, answers, weights, candidacies, order: order ?? candidacies.map((c) => c.id) });

describe("match", () => {
  it("coincidència total dona 100 i oposició total dona 0", () => {
    const same = party("same", { a: 2, b: -1, c: 0, d: 1 });
    const opposite = party("opp", { a: -2, b: 2, c: 2, d: -2 });
    const { ranked } = run({ a: 2, b: -2, c: -2, d: 2 }, [same, opposite]);
    expect(ranked.find((r) => r.id === "opp")?.affinity).toBe(0);
    expect(run({ a: 2, b: -1, c: 0, d: 1 }, [same]).ranked[0].affinity).toBe(100);
  });

  it("neutral contra extrem dona 50", () => {
    const { ranked } = run({ a: 0, b: 0, c: 0, d: 0 }, [party("p", { a: 2, b: -2, c: 2, d: -2 })]);
    expect(ranked[0].affinity).toBe(50);
  });

  it("les saltades no compten", () => {
    const p = party("p", { a: 2, b: 2, c: -2, d: -2 });
    const { ranked } = run({ a: 2, b: 2, c: null, d: null }, [p]);
    expect(ranked[0]).toMatchObject({ affinity: 100, coverage: 1 });
  });

  it("el pes d'un tema canvia l'ordre quan ha de canviar-lo", () => {
    // x encerta a, b i c (t1) i falla la d (t2); y falla a i b i encerta c i d
    const x = party("x", { a: 1, b: 1, c: 1, d: -1 });
    const y = party("y", { a: -1, b: -1, c: 1, d: 1 });
    const answers = { a: 1, b: 1, c: 1, d: 1 } as const;
    expect(run(answers, [x, y]).ranked.map((r) => r.id)).toEqual(["x", "y"]);
    expect(run(answers, [x, y], { t2: 5 }).ranked.map((r) => r.id)).toEqual(["y", "x"]);
  });

  it("només compta el sentit de la posició del partit, no la intensitat", () => {
    const author = party("author", { a: 2, b: 2, c: 2, d: 2 });
    const voter = party("voter", { a: 1, b: 1, c: 1, d: 1 });
    const { ranked } = run({ a: 1, b: 1, c: 1, d: 1 }, [author, voter]);
    expect(ranked.map((r) => r.affinity)).toEqual([100, 100]);
    expect(ranked.every((r) => r.rank === 1)).toBe(true);
  });

  it("una línia vermella pesa el triple i compta els xocs", () => {
    const p = party("p", { a: -1, b: 1, c: 1, d: 1 });
    const answers = { a: 1, b: 1, c: 1, d: 1 } as const;
    const base = match({ questions: Q, answers, candidacies: [p], order: ["p"] }).ranked[0];
    const red = match({ questions: Q, answers, candidacies: [p], order: ["p"], red: ["a"] }).ranked[0];
    expect(base).toMatchObject({ affinity: 75, clash: 0 });
    expect(red).toMatchObject({ affinity: 50, clash: 1 }); // 3 de 6 punts
  });

  it("una línia vermella sobre una abstenció no té efecte", () => {
    const p = party("p", { a: -1, b: 1, c: 1, d: 1 });
    const answers = { a: 0, b: 1, c: 1, d: 1 } as const;
    const a = match({ questions: Q, answers, candidacies: [p], order: ["p"] }).ranked[0];
    const b = match({ questions: Q, answers, candidacies: [p], order: ["p"], red: ["a"] }).ranked[0];
    expect(b).toEqual(a);
  });

  it("tot saltat: rànquing buit i eixos sense valor", () => {
    const r = run({ a: null, b: null, c: null, d: null }, [party("p", { a: 1, b: 1, c: 1, d: 1 })]);
    expect(r.ranked).toEqual([]);
    expect(r.insufficient).toEqual([{ id: "p", coverage: 0 }]);
    expect(r.user).toEqual({});
  });

  it("partit sense cap posició va a insuficients", () => {
    const r = run({ a: 1, b: 1, c: 1, d: 1 }, [party("empty", { a: null, b: null, c: null, d: null })]);
    expect(r.ranked).toEqual([]);
    expect(r.insufficient).toEqual([{ id: "empty", coverage: 0 }]);
  });

  it("aplica el llindar de cobertura just al 50 %", () => {
    expect(MIN_COVERAGE).toBe(0.5);
    const half = party("half", { a: 1, b: 1, c: null, d: null });
    const quarter = party("quarter", { a: 1, b: null, c: null, d: null });
    const r = run({ a: 1, b: 1, c: 1, d: 1 }, [half, quarter]);
    expect(r.ranked.map((x) => x.id)).toEqual(["half"]);
    expect(r.insufficient).toEqual([{ id: "quarter", coverage: 0.25 }]);
  });

  it("els empats comparteixen rang i segueixen l'ordre de la sessió", () => {
    const p1 = party("p1", { a: 1, b: 1, c: 1, d: 1 });
    const p2 = party("p2", { a: 1, b: 1, c: 1, d: 1 });
    const p3 = party("p3", { a: -2, b: -2, c: -2, d: -2 });
    const answers = { a: 1, b: 1, c: 1, d: 1 } as const;
    const r1 = run(answers, [p1, p2, p3], {}, ["p2", "p3", "p1"]);
    expect(r1.ranked.map((r) => [r.id, r.rank])).toEqual([["p2", 1], ["p1", 1], ["p3", 3]]);
    const r2 = run(answers, [p1, p2, p3], {}, ["p1", "p2", "p3"]);
    expect(r2.ranked.map((r) => r.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("decideix els empats sobre la xifra arrodonida", () => {
    const questions = Array.from({ length: 13 }, (_, i) => q(`q${i}`));
    const answers = Object.fromEntries(questions.map((x) => [x.id, 1 as Answer]));
    // mitja discrepància sobre 13 → 96,2 → 96 ; sobre 12 (una sense posició) → 95,8 → 96
    const a = party("a", { ...Object.fromEntries(questions.map((x) => [x.id, 1])), q0: 0 } as Record<string, Answer>);
    const b = party("b", { ...Object.fromEntries(questions.map((x) => [x.id, 1])), q0: 0, q12: null } as Record<string, Answer | null>);
    const r = match({ questions, answers, candidacies: [a, b], order: ["b", "a"] });
    expect(r.ranked.map((x) => [x.id, x.affinity, x.rank])).toEqual([["b", 96, 1], ["a", 96, 1]]);
  });
});

describe("axesOf", () => {
  it("dona posicions dins de [−1, 1] i ignora els eixos sense dades", () => {
    const questions = [q("a", "t", { economic: 1 }), q("b", "t", { economic: -0.5, social: 1 })];
    expect(axesOf(questions, { a: 2, b: -2 })).toEqual({ economic: 1, social: -1 });
    expect(axesOf(questions, { a: -2, b: 2 })).toEqual({ economic: -1, social: 1 });
    expect(axesOf(questions, { a: 0 })).toEqual({ economic: 0 });
  });

  it("respecta la cobertura mínima per eix", () => {
    const questions = [q("a"), q("b"), q("c")];
    expect(axesOf(questions, { a: 2 }, 0.5)).toEqual({});
    expect(axesOf(questions, { a: 2, b: 2 }, 0.5)).toEqual({ economic: 1 });
  });
});

describe("seededShuffle", () => {
  it("és determinista i no perd elements", () => {
    const items = ["a", "b", "c", "d", "e", "f"];
    expect(seededShuffle(items, 42)).toEqual(seededShuffle(items, 42));
    expect([...seededShuffle(items, 7)].sort()).toEqual(items);
  });
});

describe("dhondt", () => {
  it("reparteix tots els escons i afavoreix lleugerament els grans", () => {
    const seats = dhondt([{ id: "a", votes: 340 }, { id: "b", votes: 280 }, { id: "c", votes: 160 }, { id: "d", votes: 60 }], 7);
    expect(seats).toEqual({ a: 3, b: 3, c: 1, d: 0 });
  });
});
