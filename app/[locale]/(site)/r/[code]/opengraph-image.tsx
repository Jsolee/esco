import { ImageResponse } from "next/og";
import { symbolSvg } from "@/lib/brand";
import { getMessages, isLocale } from "@/lib/i18n";
import { AXES } from "@/lib/match";
import { resolveCompass, resolveShare } from "@/lib/shared";
import { tx } from "@/lib/text";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Escó";

const INK = "#0e0e0d";
const PAPER = "#f7f6f2";
const SYMBOL = `data:image/svg+xml;utf8,${encodeURIComponent(symbolSvg(INK, "#b9b7af"))}`;

// Lockup de la marca: símbol sobre clar + «Escó».
function Lockup() {
  return (
    <span style={{ display: "flex", alignItems: "flex-end", gap: 13, fontFamily: "Newsreader", fontStyle: "italic", fontSize: 48, lineHeight: 1 }}>
      <img src={SYMBOL} width={43} height={30} alt="" style={{ marginBottom: 7 }} />
      Escó
    </span>
  );
}

// Tipografies de la marca: Schibsted Grotesk per al text i Newsreader per al nom i els titulars. Satori no llegeix
// woff2, així que es demana a Google Fonts un subconjunt TTF. Si falla, la imatge surt igual amb la lletra per defecte.
const LATIN = " !\"#%&'()*+,-./0123456789:;?@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz·ÀÁÇÈÉÍÏÑÒÓÚÜàáçèéíïñòóúü¿¡«»–—…’";
async function googleFont(family: string, text: string, style: "normal" | "italic", weight: 300 | 400) {
  try {
    const axis = family === "Newsreader" ? `:ital,wght@${style === "italic" ? 1 : 0},${weight}` : `:wght@${weight}`;
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}${axis}&text=${encodeURIComponent(text)}`)).text();
    const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!url) return [];
    return [{ name: family, data: await (await fetch(url)).arrayBuffer(), style, weight }];
  } catch {
    return [];
  }
}
// La primera font és la de per defecte: Schibsted ha d'anar davant perquè Newsreader només surti on es demana.
const fontsFor = async (title: string) => ({
  fonts: (
    await Promise.all([
      googleFont("Schibsted Grotesk", LATIN, "normal", 400),
      googleFont("Newsreader", "Escó", "italic", 400),
      googleFont("Newsreader", title, "normal", 300),
    ])
  ).flat(),
});
const TITLE = { display: "flex", fontFamily: "Newsreader", fontWeight: 300, letterSpacing: -2, lineHeight: 1 } as const;

export default async function Image({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  const s = resolveShare(code);
  const m = getMessages(isLocale(locale) ? locale : "ca");
  const rows = s?.rows.slice(0, 3) ?? [];
  const b = s ? null : resolveCompass(code);
  const lang = isLocale(locale) ? locale : "ca";

  // Brúixola compartida: només els eixos.
  if (b)
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "64px 80px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Lockup />
            <span style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase", opacity: 0.7 }}>{tx(b.election.name, lang)}</span>
          </div>
          <div style={{ ...TITLE, fontSize: 72, marginTop: 36 }}>{m.shared.compassTitle}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 34, marginTop: 44, flex: 1 }}>
            {AXES.filter((a) => b.axes.includes(a) && b.point[a] !== undefined).map((a) => (
              <div key={a} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, opacity: 0.75 }}>
                  <span>{m.results.axes[a].neg}</span>
                  <span>{m.results.axes[a].pos}</span>
                </div>
                <div style={{ display: "flex", position: "relative", height: 18, background: "#e4e2dc", borderRadius: 9 }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, width: 2, height: 18, background: "#9a978f" }} />
                  <div style={{ position: "absolute", left: `${(b.point[a]! + 1) * 50}%`, top: -9, width: 36, height: 36, marginLeft: -18, borderRadius: 18, background: INK, border: `4px solid ${PAPER}` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 24, opacity: 0.7 }}>{m.results.disclaimer}</div>
        </div>
      ),
      { ...size, ...(await fontsFor(m.shared.compassTitle)) },
    );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "64px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30 }}>
          <Lockup />
          {s && (
            <span style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase", opacity: 0.7 }}>
              {tx(s.election.name, locale)}
              {s.election.fictional ? ` · ${m.game.fictional}` : ""}
            </span>
          )}
        </div>
        <div style={{ ...TITLE, fontSize: 80, marginTop: 40 }}>{m.results.kicker}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 40, flex: 1 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 36 }}>
              <span style={{ width: 300, display: "flex" }}>{r.name}</span>
              <span style={{ width: 120, display: "flex", justifyContent: "flex-end" }}>{r.affinity}%</span>
              <div style={{ flex: 1, height: 26, display: "flex", background: "#e4e2dc" }}>
                <div style={{ width: `${r.affinity}%`, background: r.color, border: `2px solid ${INK}` }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 24, opacity: 0.7 }}>{m.results.disclaimer}</div>
      </div>
    ),
    { ...size, ...(await fontsFor(m.results.kicker)) },
  );
}
