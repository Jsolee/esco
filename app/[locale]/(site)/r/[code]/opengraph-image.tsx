import { ImageResponse } from "next/og";
import { getMessages, isLocale } from "@/lib/i18n";
import { resolveShare } from "@/lib/shared";
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
