import type { Point } from "./match";
import type { Answer, Axis } from "./schema";

// Dades d'una elecció ja localitzades, tal com arriben al client.
export type GQuestion = { id: string; topic: string; text: string; context: string; axes: Partial<Record<Axis, number>> };
export type GCandidacy = {
  id: string;
  name: string;
  short: string;
  color: string;
  members?: string[];
  circumscriptions: "all" | string[];
  positions: Record<string, { value: Answer | null; source: string; page?: number; url?: string; quote?: string }>;
  sources: Record<string, { title: string; url: string; lang: string }>;
  axes: Point; // posició als eixos, calculada en build
};
export type GameData = {
  electionId: string;
  name: string;
  fictional: boolean;
  axes: Axis[];
  facts: string[];
  questions: GQuestion[];
  topics: { id: string; name: string }[];
  candidacies: GCandidacy[];
  provinces: { id: string; name: string }[];
};
