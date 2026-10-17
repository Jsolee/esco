import { getElection } from "./data";
import { decodeCompass, decodeShare } from "./share";

// Resol un codi compartit contra les dades del repo. Els noms i colors surten d'aquí, mai de l'URL.
export function resolveShare(code: string) {
  const decoded = decodeShare(code, (id) => {
    const e = getElection(id);
    // Només eleccions amb resultats publicats: en mode brúixola les candidatures encara no són públiques.
    return e && (e.election.status === "open" || e.election.status === "archived") ? new Set(e.candidacies.map((c) => c.id)) : undefined;
  });
  if (!decoded) return null;
  const e = getElection(decoded.electionId)!;
  return {
    election: e.election,
    rows: decoded.rows.map((r) => {
      const c = e.candidacies.find((x) => x.id === r.id)!;
      return { ...r, name: c.name, color: c.color };
    }),
  };
}

// Brúixola compartida: només la posició als eixos.
export function resolveCompass(code: string) {
  const decoded = decodeCompass(code, (id) => getElection(id) !== undefined);
  if (!decoded) return null;
  const e = getElection(decoded.electionId)!;
  return { election: e.election, point: decoded.point, axes: e.election.axes };
}
