"use client";

import type { Point } from "@/lib/match";
import type { Axis } from "@/lib/schema";
import { useI18n } from "../I18n";

export type MapPoint = { id: string; label: string; color?: string; point: Point; you?: boolean };

const C = 200;
const S = 160;
const X = (v: number) => C + v * S;
const Y = (v: number) => C - v * S;
const fmt = (v: number | undefined) => (v === undefined ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}`);

export function PoliticalMap({ points, axes }: { points: MapPoint[]; axes: Axis[] }) {
  const { m } = useI18n();
  const a = m.results.axes;
  const plotted = points.filter((p) => p.point.economic !== undefined && p.point.social !== undefined);

  // Etiquetes: a la dreta del punt (a l'esquerra si és a la vora) i separades si es trepitgen.
  const labels = plotted
    .map((p) => {
      const x = X(p.point.economic!);
      const y = Y(p.point.social!);
      const left = x > 300;
      return { ...p, x, y, lx: left ? x - 12 : x + 12, ly: y + 4, left };
    })
    .sort((p, q) => p.ly - q.ly);
  labels.forEach((l, i) => {
    for (let j = 0; j < i; j++) {
      const o = labels[j];
      if (Math.abs(o.ly - l.ly) < 14 && Math.abs(o.lx - l.lx) < 70) l.ly = o.ly + 14;
    }
  });

  const terr = axes.includes("territorial") ? points.filter((p) => p.point.territorial !== undefined) : [];

  return (
    <figure className="grid gap-6">
      <svg viewBox="0 0 400 400" className="w-full max-w-xl" role="img" aria-label={`${a.economic.name} / ${a.social.name}`}>
        {[-1, -0.5, 0.5, 1].map((v) => (
          <g key={v} className="stroke-rule" strokeWidth={1}>
            <line x1={X(v)} y1={Y(1)} x2={X(v)} y2={Y(-1)} />
            <line x1={X(-1)} y1={Y(v)} x2={X(1)} y2={Y(v)} />
          </g>
        ))}
        <line x1={X(-1)} y1={C} x2={X(1)} y2={C} className="stroke-ink-3" />
        <line x1={C} y1={Y(1)} x2={C} y2={Y(-1)} className="stroke-ink-3" />
        <g className="fill-ink-2 text-[10.5px] font-semibold uppercase tracking-[0.08em]">
          <text x={X(-1) + 4} y={C - 8}>{a.economic.neg}</text>
          <text x={X(1) - 4} y={C - 8} textAnchor="end">{a.economic.pos}</text>
          <text x={C + 8} y={Y(1) + 14}>{a.social.pos}</text>
          <text x={C + 8} y={Y(-1) - 6}>{a.social.neg}</text>
        </g>
        {labels.map((p) =>
          p.you ? (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r={9} className="fill-paper stroke-ink" strokeWidth={2} />
              <circle cx={p.x} cy={p.y} r={2.5} className="fill-ink" />
              <text x={p.lx} y={p.ly} textAnchor={p.left ? "end" : "start"} className="fill-ink text-[13px] font-bold">
                {p.label}
              </text>
            </g>
          ) : (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r={7} fill={p.color} className="stroke-ink" strokeWidth={1} />
              <text x={p.lx} y={p.ly} textAnchor={p.left ? "end" : "start"} className="fill-ink text-[12px] font-medium">
                {p.label}
              </text>
            </g>
          ),
        )}
      </svg>

      {terr.length > 0 && (
        <svg viewBox="0 0 400 70" className="w-full max-w-xl" role="img" aria-label={a.territorial.name}>
          <line x1={X(-1)} y1={32} x2={X(1)} y2={32} className="stroke-ink-3" />
          {terr.map((p) => {
            const x = X(p.point.territorial!);
            return p.you ? (
              <g key={p.id}>
                <circle cx={x} cy={32} r={8} className="fill-paper stroke-ink" strokeWidth={2} />
                <circle cx={x} cy={32} r={2.2} className="fill-ink" />
              </g>
            ) : (
              <circle key={p.id} cx={x} cy={32} r={6} fill={p.color} className="stroke-ink" strokeWidth={1} />
            );
          })}
          <g className="fill-ink-2 text-[10.5px] font-semibold uppercase tracking-[0.08em]">
            <text x={X(-1)} y={62}>{a.territorial.neg}</text>
            <text x={X(1)} y={62} textAnchor="end">{a.territorial.pos}</text>
          </g>
        </svg>
      )}

      <details className="group">
        <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
          {m.results.asTable} <span aria-hidden className="transition group-open:rotate-90">›</span>
        </summary>
        <div className="overflow-x-auto">
          <table className="num mt-2 w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                <th scope="col" className="py-2 pr-4 font-semibold">{m.results.colCandidacy}</th>
                {axes.map((ax) => (
                  <th key={ax} scope="col" className="py-2 pr-4 font-semibold">
                    {a[ax].name} <span className="font-normal text-ink-3">({a[ax].neg} − / {a[ax].pos} +)</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.id} className="border-b border-rule">
                  <th scope="row" className={`py-2 pr-4 text-left ${p.you ? "font-bold" : "font-normal"}`}>{p.label}</th>
                  {axes.map((ax) => (
                    <td key={ax} className="py-2 pr-4">{fmt(p.point[ax])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
