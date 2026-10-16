// Text localitzat de les dades. Euskera i gallec cauran al castellà fins que tinguin traducció.
export const tx = (text: Record<string, string>, locale: string) => text[locale] ?? text.es;

export const format = (s: string, vars: Record<string, string | number> = {}) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));

export const pad2 = (n: number) => String(n).padStart(2, "0");
