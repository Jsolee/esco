import { RANK, SEATS } from "@/lib/hemicycle";

export type SeatStyle = { fill: string; opacity?: number; delay?: number; cls?: string; stroke?: boolean };

// 350 escons en SVG. `seat(i)` decideix l'aspecte de cada seient (i = índex d'esquerra a dreta).
export function Hemicycle({
  seat,
  className = "",
  label,
  you,
}: {
  seat: (i: number, rank: number) => SeatStyle;
  className?: string;
  label?: string;
  you?: number; // seient destacat ("el teu escó")
}) {
  return (
    <svg
      viewBox="-104 -103 208 107"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {SEATS.map((s, i) => {
        const st = seat(i, RANK[i]);
        return (
          <circle
            key={i}
            cx={(s.x * 100).toFixed(2)}
            cy={(-s.y * 100).toFixed(2)}
            r={2.35}
            className={st.cls ? `seat ${st.cls}` : "seat"}
            style={
              {
                fill: st.stroke ? "transparent" : st.fill,
                stroke: st.stroke ? st.fill : undefined,
                strokeWidth: st.stroke ? 0.7 : undefined,
                opacity: st.opacity ?? 1,
                "--d": `${st.delay ?? 0}ms`,
                "--i": RANK[i],
                "--r": ((i * 7919) % 350) / 350,
              } as React.CSSProperties
            }
          />
        );
      })}
      {you !== undefined && (
        <circle
          cx={(SEATS[you].x * 100).toFixed(2)}
          cy={(-SEATS[you].y * 100).toFixed(2)}
          r={2.35}
          className="you-seat"
          style={{ fill: "currentColor" }}
        />
      )}
    </svg>
  );
}
