import { z } from "zod";
import { RAW } from "@/data";
import { Candidacy, Election, Question, Territory, Topic } from "./schema";
import type { Axis } from "./schema";

export type ElectionData = {
  election: Election;
  questions: Question[];
  candidacies: Candidacy[];
};

function parse<T>(schema: z.ZodType<T>, value: unknown, where: string): T {
  const r = schema.safeParse(value);
  if (!r.success) throw new Error(`Dades invàlides a ${where}:\n${z.prettifyError(r.error)}`);
  return r.data;
}

// Valida totes les dades i les referències creuades. Llença un error que atura el build.
export function loadData(raw: unknown = RAW) {
  const r = raw as typeof RAW;
  const territory = parse(Territory, r.territory, "data/territory.json");
  const topics = parse(z.array(Topic), r.topics, "data/topics.json");
  const provinceIds = new Set(territory.provinces.map((p) => p.id));
  const topicIds = new Set(topics.map((t) => t.id));
  const errors: string[] = [];

  const elections: ElectionData[] = r.elections.map((e) => {
    const base = `data/elections/${(e.election as { id?: string }).id ?? "?"}`;
    const election = parse(Election, e.election, `${base}/election.json`);
    const questions = parse(z.array(Question), e.questions, `${base}/questions.json`);
    const candidacies = e.candidacies.map((c) =>
      parse(Candidacy, c, `${base}/candidacies/${(c as { id?: string }).id ?? "?"}.json`),
    );

    const qIds = new Set<string>();
    for (const f of election.funding) {
      if (qIds.has(f.id)) errors.push(`${base}: font de finançament repetida «${f.id}»`);
      qIds.add(f.id);
      if (!topicIds.has(f.topic)) errors.push(`${base}: la font «${f.id}» té un tema inexistent «${f.topic}»`);
    }
    for (const q of questions) {
      if (q.budget !== undefined && election.status === "open" && !election.fictional && !q.budgetSource)
        errors.push(`${base}: «${q.id}» té cost però no diu d'on surt l'estimació (budgetSource)`);
      if (qIds.has(q.id)) errors.push(`${base}: afirmació repetida «${q.id}»`);
      qIds.add(q.id);
      if (!topicIds.has(q.topic)) errors.push(`${base}: «${q.id}» té un tema inexistent «${q.topic}»`);
      for (const axis of Object.keys(q.axes) as Axis[])
        if (!election.axes.includes(axis)) errors.push(`${base}: «${q.id}» fa servir l'eix «${axis}», que l'elecció no declara`);
    }

    // Una elecció oberta s'ha de poder jugar: candidatures oficials, amb fonts i posició a cada afirmació.
    const open = election.status === "open";
    if (open && questions.length === 0) errors.push(`${base}: una elecció oberta necessita almenys una afirmació`);
    const namesByCirc = new Map<string, string>();
    const cIds = new Set<string>();
    for (const c of candidacies) {
      const where = `${base}/candidacies/${c.id}.json`;
      if (cIds.has(c.id)) errors.push(`${where}: candidatura repetida «${c.id}»`);
      cIds.add(c.id);
      const sourceIds = new Set(c.sources.map((s) => s.id));
      if (sourceIds.size < c.sources.length) errors.push(`${where}: hi ha fonts amb el mateix id`);
      if (open && c.provisional) errors.push(`${where}: una elecció oberta no pot tenir candidatures provisionals`);
      if (open && c.sources.length === 0) errors.push(`${where}: una elecció oberta necessita almenys una font`);
      if (open)
        for (const id of [...questions.map((q) => q.id), ...election.funding.map((f) => f.id)])
          if (!(id in c.positions)) errors.push(`${where}: falta la posició sobre «${id}» (escriu null si no s'hi pronuncia)`);
      for (const [qid, p] of Object.entries(c.positions)) {
        if (!qIds.has(qid)) errors.push(`${where}: posició sobre una afirmació inexistent «${qid}»`);
        if (!sourceIds.has(p.source)) errors.push(`${where}: «${qid}» cita una font inexistent «${p.source}»`);
      }
      const circs = c.circumscriptions === "all" ? [...provinceIds] : c.circumscriptions;
      for (const id of circs) {
        if (!provinceIds.has(id)) errors.push(`${where}: província inexistent «${id}»`);
        const key = `${id}:${c.name}`;
        if (namesByCirc.has(key)) errors.push(`${where}: el nom «${c.name}» ja existeix a la circumscripció ${id}`);
        namesByCirc.set(key, c.id);
      }
    }
    return { election, questions, candidacies };
  });

  if (errors.length) throw new Error(`Dades invàlides:\n- ${errors.join("\n- ")}`);
  return { territory, topics, elections };
}

export const DATA = loadData();

export const getElection = (id: string) => DATA.elections.find((e) => e.election.id === id);
