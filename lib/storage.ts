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
