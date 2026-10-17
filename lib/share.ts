// Codi del resultat compartit: «eleccio~candidatura.percentatge~…». Només ids i xifres arrodonides,
// mai respostes. Els noms es llegeixen sempre de les dades, no de l'enllaç.
export const SHARE_MAX = 5;

export const encodeShare = (electionId: string, rows: { id: string; affinity: number }[]) =>
  [electionId, ...rows.slice(0, SHARE_MAX).map((r) => `${r.id}.${r.affinity}`)].join("~");

export function decodeShare(code: string, known: (electionId: string) => Set<string> | undefined) {
  const [electionId, ...parts] = decodeURIComponent(code).split("~");
  const ids = known(electionId);
  if (!ids || parts.length === 0 || parts.length > SHARE_MAX) return null;
  const rows: { id: string; affinity: number }[] = [];
  for (const part of parts) {
    const m = /^([a-z0-9-]+)\.(\d{1,3})$/.exec(part);
    if (!m || !ids.has(m[1]) || rows.some((r) => r.id === m[1])) return null;
    const affinity = Number(m[2]);
    // El resultat sempre surt ordenat de més a menys: un altre ordre és un enllaç fet a mà.
    if (affinity > 100 || affinity > (rows.at(-1)?.affinity ?? 100)) return null;
    rows.push({ id: m[1], affinity });
  }
  return { electionId, rows };
}
