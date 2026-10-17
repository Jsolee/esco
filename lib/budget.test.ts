import { describe, expect, it } from "vitest";
import { balanceOf, fundingAnswers, needFor, remainingOf, usedOf, weightOf, type Alloc } from "./budget";

const Q = [
  { id: "pisos", budget: -12 },
  { id: "dentista", budget: -8 },
  { id: "fortunes", budget: 5 },
  { id: "referendum" },
];
const S = [
  { id: "defensa", capacity: 6 },
  { id: "irpf", capacity: 6 },
  { id: "deute", capacity: 10 },
];

describe("pressupost", () => {
  it("sense ingressos, tot el cost s'ha de finançar", () => {
    expect(needFor(Q[0], 2, Q, {}, {})).toBe(12);
    expect(needFor(Q[0], 1, Q, {}, {})).toBe(12);
  });

  it("votar en contra o neutral no costa res, ni les propostes sense cost", () => {
    expect(needFor(Q[0], 0, Q, {}, {})).toBe(0);
    expect(needFor(Q[0], -2, Q, {}, {})).toBe(0);
    expect(needFor(Q[3], 2, Q, {}, {})).toBe(0);
    expect(needFor(Q[2], 2, Q, {}, {})).toBe(0);
  });

  it("els ingressos aprovats paguen part de la despesa", () => {
    expect(needFor(Q[0], 2, Q, { fortunes: 1 }, {})).toBe(7);
  });

  it("el saldo suma ingressos i fonts i resta costos", () => {
    const alloc: Alloc = { pisos: { defensa: 6, deute: 6 } };
    expect(balanceOf(Q, { pisos: 2, fortunes: 1 }, alloc)).toBe(5);
    expect(needFor(Q[1], 1, Q, { pisos: 2, fortunes: 1 }, alloc)).toBe(3);
  });

  it("en tornar a votar una proposta, se n'allibera el finançament", () => {
    const alloc: Alloc = { pisos: { defensa: 6, deute: 6 } };
    expect(needFor(Q[0], 2, Q, { pisos: 2 }, alloc)).toBe(12);
    expect(remainingOf(S, alloc, "pisos")).toEqual({ defensa: 6, irpf: 6, deute: 10 });
    expect(remainingOf(S, alloc)).toEqual({ defensa: 0, irpf: 6, deute: 4 });
  });

  it("fer servir una font compta com estar-hi d'acord, i a fons com molt d'acord", () => {
    const alloc: Alloc = { pisos: { defensa: 6, deute: 3 }, dentista: { irpf: 2 } };
    expect(usedOf(alloc)).toEqual({ defensa: 6, deute: 3, irpf: 2 });
    expect(fundingAnswers(S, alloc)).toEqual({ defensa: 2, deute: 1, irpf: 1 });
  });

  it("les fitxes sumen pes de mig en mig", () => {
    expect(weightOf(0)).toBe(1);
    expect(weightOf(2)).toBe(2);
    expect(weightOf(10)).toBe(6);
  });
});
