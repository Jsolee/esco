import type { Point } from "./match";
import type { Answer, Axis } from "./schema";

// Dades d'una elecció ja localitzades, tal com arriben al client.
export type GQuestion = { id: string; topic: string; text: string; context: string; axes: Partial<Record<Axis, number>>; budget?: number };
export type GFunding = { id: string; kind: "cut" | "tax" | "debt"; topic: string; name: string; detail: string; capacity: number; axes: Partial<Record<Axis, number>> };
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
  reveal?: string; // mode brúixola: encara no hi ha candidatures; es revelaran en aquesta data
  name: string;
  fictional: boolean;
  axes: Axis[];
  facts: string[];
  questions: GQuestion[];
  funding: GFunding[];
  topics: { id: string; name: string }[];
  candidacies: GCandidacy[];
  provinces: { id: string; name: string }[];
};
