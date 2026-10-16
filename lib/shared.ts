import { getElection } from "./data";
import { decodeShare } from "./share";

// Resol un codi compartit contra les dades del repo. Els noms i colors surten d'aquí, mai de l'URL.
export function resolveShare(code: string) {
  const decoded = decodeShare(code, (id) => {
    const e = getElection(id);
    return e && new Set(e.candidacies.map((c) => c.id));
  });
  if (!decoded) return null;
  const e = getElection(decoded.electionId)!;
  return {
    election: e.election,
    questions: e.questions.length,
    rows: decoded.rows.map((r) => {
      const c = e.candidacies.find((x) => x.id === r.id)!;
      return { ...r, name: c.name, color: c.color };
    }),
  };
}
