import { describe, expect, it } from "vitest";
import { RAW } from "@/data";
import { DATA, loadData } from "./data";
import { decodeShare, encodeShare } from "./share";
import { provinceFromPostcode, searchProvinces } from "./territory";
import { SEATS, FILL } from "./hemicycle";

const clone = () => structuredClone(RAW);

describe("dades del repo", () => {
  it("passen la validació", () => {
    expect(DATA.elections.length).toBeGreaterThan(0);
    expect(DATA.territory.provinces).toHaveLength(52);
  });

  it("fallen si a una candidatura li falta una afirmació", () => {
    const raw = clone();
    delete (raw.elections[0].candidacies[0].positions as Record<string, unknown>)["hab-lloguer"];
    expect(() => loadData(raw)).toThrow(/falta la posició sobre «hab-lloguer»/);
  });

  it("fallen si una posició amb valor no té pàgina ni URL", () => {
    const raw = clone();
    const p = raw.elections[0].candidacies[0].positions as Record<string, { value: number | null; page?: number }>;
    p["hab-lloguer"] = { value: 1 } as never;
    (p["hab-lloguer"] as Record<string, unknown>).source = "programa";
    expect(() => loadData(raw)).toThrow(/pàgina o URL/);
  });

  it("accepten candidatures provisionals sense posicions en una elecció propera", () => {
    const upcoming = DATA.elections.find((e) => e.election.status === "upcoming");
    expect(upcoming?.candidacies.every((c) => c.provisional && Object.keys(c.positions).length === 0)).toBe(true);
  });

  it("fallen si una elecció oberta té candidatures provisionals o sense fonts", () => {
    const provisional = clone();
    (provisional.elections[0].candidacies[0] as Record<string, unknown>).provisional = true;
    expect(() => loadData(provisional)).toThrow(/no pot tenir candidatures provisionals/);
    const noSources = clone();
    const g26 = noSources.elections[1];
    (g26.election as Record<string, unknown>).status = "open";
    expect(() => loadData(noSources)).toThrow(/necessita almenys una font/);
  });

  it("fallen si es cita una font inexistent", () => {
    const raw = clone();
    const p = raw.elections[0].candidacies[0].positions as Record<string, { source: string }>;
    p["hab-lloguer"].source = "no-existeix";
    expect(() => loadData(raw)).toThrow(/font inexistent/);
  });
});

describe("territori", () => {
  it("dedueix la província del codi postal", () => {
    expect(provinceFromPostcode("08001")).toBe("08");
    expect(provinceFromPostcode("07800")).toBe("07");
    expect(provinceFromPostcode("52001")).toBe("52");
    expect(provinceFromPostcode("53001")).toBeNull();
    expect(provinceFromPostcode("00123")).toBeNull();
    expect(provinceFromPostcode("8001")).toBeNull();
  });

  it("troba províncies per nom, sense accents, i per àlies", () => {
    const provinces = DATA.territory.provinces.map((p) => ({ id: p.id, name: p.name.ca, community: p.community, aliases: p.aliases }));
    expect(searchProvinces("lerida", provinces)[0].province.id).toBe("25");
    expect(searchProvinces("Càceres", provinces)[0].province.id).toBe("10");
    expect(searchProvinces("bilbao", provinces)[0].province.id).toBe("48");
  });
});

describe("enllaç compartit", () => {
  const known = (id: string) => (id === "e" ? new Set(["a", "b"]) : undefined);

  it("fa el viatge d'anada i tornada", () => {
    const code = encodeShare("e", [{ id: "a", affinity: 78 }, { id: "b", affinity: 64 }]);
    expect(decodeShare(code, known)).toEqual({ electionId: "e", rows: [{ id: "a", affinity: 78 }, { id: "b", affinity: 64 }] });
  });

  it("rebutja ids desconeguts, xifres fora de rang i repeticions", () => {
    expect(decodeShare("e~zz.50", known)).toBeNull();
    expect(decodeShare("e~a.101", known)).toBeNull();
    expect(decodeShare("e~a.50~a.40", known)).toBeNull();
    expect(decodeShare("x~a.50", known)).toBeNull();
    expect(decodeShare("e~<script>.1", known)).toBeNull();
  });
});

describe("hemicicle", () => {
  it("té 350 escons i un ordre d'encesa complet", () => {
    expect(SEATS).toHaveLength(350);
    expect(new Set(FILL).size).toBe(350);
  });
});
