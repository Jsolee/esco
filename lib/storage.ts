// Tot el que es desa viu a sessionStorage: s'esborra en tancar la pestanya i no surt mai del navegador.
export const PROVINCE_KEY = "esco-province";

export function rememberProvince(id: string) {
  try {
    sessionStorage.setItem(PROVINCE_KEY, id);
  } catch {}
}

export function readProvince(): string | null {
  try {
    return sessionStorage.getItem(PROVINCE_KEY);
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Avisos que només es mostren la primera vegada (localStorage: es recorda entre partides en aquest dispositiu).
export function seen(key: string): boolean {
  try {
    return localStorage.getItem(`esco-vist:${key}`) === "1";
  } catch {
    return false;
  }
}

export function markSeen(key: string) {
  try {
    localStorage.setItem(`esco-vist:${key}`, "1");
  } catch {}
}
