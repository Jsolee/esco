export type ProvinceOption = { id: string; name: string; community: string; aliases: string[] };

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Les dues primeres xifres d'un codi postal espanyol són el codi INE de la província (01–52).
export function provinceFromPostcode(cp: string): string | null {
  if (!/^\d{5}$/.test(cp.trim())) return null;
  const n = Number(cp.trim().slice(0, 2));
  return n >= 1 && n <= 52 ? String(n).padStart(2, "0") : null;
}

// ponytail: cerca sobre províncies, capitals i alguns municipis grans; la llista completa de l'INE quan calgui.
export function searchProvinces(query: string, provinces: ProvinceOption[], limit = 6) {
  const q = normalize(query);
  if (!q) return [];
  const hits: { province: ProvinceOption; label: string; score: number }[] = [];
  for (const p of provinces) {
    let best: { label: string; score: number } | null = null;
    for (const label of [p.name, ...p.aliases]) {
      const n = normalize(label);
      const score = n === q ? 0 : n.startsWith(q) ? 1 : n.split(" ").some((w) => w.startsWith(q)) ? 2 : -1;
      if (score >= 0 && (!best || score < best.score)) best = { label, score };
    }
    if (best) hits.push({ province: p, ...best });
  }
  return hits.sort((a, b) => a.score - b.score || a.label.localeCompare(b.label)).slice(0, limit);
}
