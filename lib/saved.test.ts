import { describe, expect, it } from "vitest";
import { DATA } from "./data";
import { clean, decodeSaved, encodeSaved, type Saved } from "./saved";

const e = DATA.elections.find((x) => x.election.id === "generals-2026")!;
const qids = e.questions.map((q) => q.id);
const tids = DATA.topics.map((t) => t.id);
const values = [2, 1, 0, -1, -2, null] as const;
const saved: Saved = {
  province: "08",
  answers: Object.fromEntries(qids.map((id, i) => [id, values[i % values.length]])),
  tokens: { habitatge: 4, sanitat: 6 },
  red: [qids[0], qids[3]], // +2 i −1: dues línies vermelles
};

describe("respostes desades", () => {
  it("l'enllaç privat recupera exactament les respostes, les fitxes i la província", () => {
    const code = encodeSaved(saved, qids, tids);
    expect(code).toMatch(/^1-08-/);
    expect(code.length).toBeLessThan(100);
    expect(decodeSaved(code, qids, tids)).toEqual(saved);
  });

  it("no hi ha dos ids d'afirmació amb el mateix hash a les eleccions del repo", () => {
    for (const el of DATA.elections) {
      const code = encodeSaved({ province: null, answers: Object.fromEntries(el.questions.map((q) => [q.id, 1])), tokens: {} }, el.questions.map((q) => q.id), tids);
      expect(Object.keys(decodeSaved(code, el.questions.map((q) => q.id), tids)!.answers)).toHaveLength(el.questions.length);
    }
  });

  it("les línies vermelles només valen amb un sí o un no, i com a màxim tres", () => {
    const many = { ...saved, red: [qids[0], qids[2], qids[5], qids[3], qids[6], qids[1]] }; // qids[2] és 0 i qids[5] saltada
    expect(clean(many, qids, tids)!.red).toEqual([qids[0], qids[3], qids[6]]);
  });

  it("si una afirmació canvia d'id, només es perd aquella resposta", () => {
    const code = encodeSaved(saved, qids, tids);
    const renamed = qids.map((id, i) => (i === 0 ? `${id}-nova` : id));
    const back = decodeSaved(code, renamed, tids)!;
    expect(back.answers[renamed[0]]).toBeUndefined();
    expect(Object.keys(back.answers)).toHaveLength(qids.length - 1);
  });

  it("rebutja codis mal formats o sense cap resposta votada", () => {
    expect(decodeSaved("", qids, tids)).toBeNull();
    expect(decodeSaved("2-08--", qids, tids)).toBeNull();
    expect(decodeSaved("1-08-zzq-", qids, tids)).toBeNull();
    expect(decodeSaved(encodeSaved({ province: null, answers: { [qids[0]]: null }, tokens: {} }, qids, tids), qids, tids)).toBeNull();
  });

  it("neteja valors fora de rang i províncies estranyes", () => {
    const dirty = { province: "<b>", answers: { [qids[0]]: 7, [qids[1]]: 1, inventada: 2 }, tokens: { habitatge: -1, inventat: 3 } } as unknown as Saved;
    expect(clean(dirty, qids, tids)).toEqual({ province: null, answers: { [qids[1]]: 1 }, tokens: {}, red: [] });
  });
});
