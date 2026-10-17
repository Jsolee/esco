import { ImageResponse } from "next/og";
import { getMessages, isLocale } from "@/lib/i18n";
import { AXES } from "@/lib/match";
import { resolveCompass, resolveShare } from "@/lib/shared";
import { tx } from "@/lib/text";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Escó";

const INK = "#0e0e0d";
const PAPER = "#f7f6f2";

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
            <span style={{ fontStyle: "italic", fontSize: 48 }}>Escó</span>
            <span style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase", opacity: 0.7 }}>{tx(b.election.name, lang)}</span>
          </div>
          <div style={{ display: "flex", fontSize: 64, marginTop: 36, letterSpacing: -2 }}>{m.shared.compassTitle}</div>
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
      size,
    );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "64px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30 }}>
          <span style={{ fontStyle: "italic", fontSize: 48 }}>Escó</span>
          {s && (
            <span style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase", opacity: 0.7 }}>
              {tx(s.election.name, locale)}
              {s.election.fictional ? ` · ${m.game.fictional}` : ""}
            </span>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 72, marginTop: 40, letterSpacing: -2 }}>{m.results.kicker}</div>
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
    size,
  );
}
