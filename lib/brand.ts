// Símbol de la marca (brand/README.md): arc de 7 escons, el del mig és el teu, més gran i l'únic encès.
// Mateixa geometria que brand/logo/*.svg i brand/source/kit.html.
export const SYMBOL_VIEWBOX = "0 0 120 84";

export const SYMBOL_SEATS = Array.from({ length: 7 }, (_, k) => {
  const a = Math.PI * (1 - k / 6);
  const you = k === 3;
  return {
    you,
    x: +(60 + 46 * Math.cos(a)).toFixed(2),
    y: +(66 - 46 * Math.sin(a)).toFixed(2),
    rotate: +(90 - (a * 180) / Math.PI).toFixed(1),
    w: you ? 21 : 16,
    h: you ? 18 : 14,
    rx: you ? 5.5 : 4.5,
  };
});

/** El símbol com a SVG autònom (imatges generades, on no hi ha currentColor). */
export function symbolSvg(on: string, dim: string) {
  const seats = SYMBOL_SEATS.map(
    (s) =>
      `<rect x="${-s.w / 2}" y="${-s.h / 2}" width="${s.w}" height="${s.h}" rx="${s.rx}" fill="${s.you ? on : dim}" transform="translate(${s.x} ${s.y}) rotate(${s.rotate})"/>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SYMBOL_VIEWBOX}">${seats}</svg>`;
}
