"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useId, useRef } from "react";
import type { GameData, GQuestion } from "@/lib/game";
import { format } from "@/lib/text";
import { Hemicycle } from "../Hemicycle";
import { useI18n } from "../I18n";

export function Intro({
  data,
  province,
  count,
  onProvince,
  onStart,
}: {
  data: GameData;
  province: string | null;
  count: number;
  onProvince: (id: string) => void;
  onStart: () => void;
}) {
  const { m } = useI18n();
  const id = useId();
  const i = m.game.intro;
  const arrow = { right: "→", left: "←", up: "↑" } as const;

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-12 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="rise max-w-xl">
        <p className="kicker text-chalk-2">
          {i.kicker} · {data.name}
        </p>
        <h1 className="display mt-4 text-[clamp(2.9rem,1.6rem+5.2vw,5.8rem)]">{i.title}</h1>
        <p className="mt-5 text-lg text-chalk-2">{format(i.text, { n: count })}</p>
        <ul className="mt-6 grid gap-2.5">
          {i.gestures.map((g) => (
            <li key={g.dir} className="flex items-center gap-3">
              <span aria-hidden className="grid size-9 place-items-center rounded-full border border-chalk-3/60 text-chalk">
                {arrow[g.dir as keyof typeof arrow]}
              </span>
              <span>{g.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-2">
          <label htmlFor={`${id}-p`} className="text-sm text-chalk-2">
            {province ? i.circ : i.pick}
          </label>
          <select
            id={`${id}-p`}
            value={province ?? ""}
            onChange={(e) => e.target.value && onProvince(e.target.value)}
            className="min-h-12 w-full max-w-sm rounded-full border border-chalk-3/60 bg-stage-2 px-4 font-serif text-xl text-chalk"
          >
            {!province && <option value="">{i.pick}</option>}
            {data.provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={onStart} disabled={!province} className="btn group mt-8 bg-chalk px-8 text-lg text-stage">
          {i.start} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </button>
        <p className="mt-4 hidden text-sm text-chalk-3 [@media(hover:hover)]:block">{i.keys}</p>
        {data.fictional && (
          <p className="mt-6 max-w-md border-l-2 border-dashed border-chalk-3 pl-3 text-sm text-chalk-2">
            <strong className="kicker mr-2 text-chalk">{m.game.fictional}</strong>
            {m.game.fictionalBanner}
          </p>
        )}
      </div>

      <div aria-hidden className="relative mx-auto hidden h-[360px] w-[300px] shrink-0 sm:block lg:mx-0">
        <div className="absolute inset-0 translate-y-7 scale-90 rounded-[28px] bg-card-3" />
        <div className="absolute inset-0 translate-y-3.5 scale-95 rounded-[28px] bg-card-2" />
        <div className="demo-card absolute inset-0 flex flex-col rounded-[28px] bg-card p-6 text-card-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
          <p className="kicker text-card-ink-2">
            {i.demoLabel} · {i.demoTopic}
          </p>
          <p className="my-auto font-serif text-[1.75rem] leading-[1.1]">{i.demo}</p>
          <span className="demo-yes absolute left-5 top-16 -rotate-12 rounded-lg border-[3px] border-card-ink px-3 py-1 text-lg font-extrabold uppercase tracking-wider">
            {m.game.votes["1"]}
          </span>
          <span className="demo-no absolute right-5 top-16 rotate-12 rounded-lg border-[3px] border-card-ink px-3 py-1 text-lg font-extrabold uppercase tracking-wider">
            {m.game.votes["-1"]}
          </span>
        </div>
      </div>
    </main>
  );
}

export function Priorities({
  topics,
  questions,
  selected,
  onToggle,
  onUndo,
  onGo,
}: {
  topics: GameData["topics"];
  questions: GQuestion[];
  selected: string[];
  onToggle: (topic: string) => void;
  onUndo: () => void;
  onGo: () => void;
}) {
  const { m } = useI18n();
  const p = m.game.priorities;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus({ preventScroll: true }), []);

  return (
    <main className="rise relative mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
      <p className="kicker text-chalk-2">{p.kicker}</p>
      <h1 ref={heading} tabIndex={-1} className="display mt-3 text-[clamp(2.7rem,1.6rem+4.4vw,5rem)] outline-none">
        {p.title}
      </h1>
      <p className="mt-4 max-w-[46ch] text-lg text-chalk-2">{p.text}</p>
      <div role="group" aria-label={p.title} className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {topics.map((t) => {
          const on = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(t.id)}
              className={`group relative flex min-h-36 flex-col justify-between rounded-2xl border p-4 text-left transition duration-200 ease-out-quint active:scale-[0.97] ${
                on ? "border-chalk bg-chalk text-stage" : "border-chalk-3/50 bg-stage-2 text-chalk hover:border-chalk-2"
              }`}
            >
              <span className="font-serif text-[1.45rem] leading-tight">{t.name}</span>
              <span className="flex items-end justify-between gap-2">
                <span className={`text-xs ${on ? "text-stage/70" : "text-chalk-2"}`}>
                  {format(p.count, { n: questions.filter((q) => q.topic === t.id).length })}
                </span>
                <span
                  aria-hidden
                  className={`num font-serif text-3xl italic leading-none transition duration-300 ease-out-quint ${
                    on ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                >
                  ×2
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 min-h-6 text-sm text-chalk-3" aria-live="polite">
        {selected.length === 0 ? p.none : null}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <button type="button" onClick={onGo} className="btn group bg-chalk px-8 text-lg text-stage">
          {p.go} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </button>
        <button type="button" onClick={onUndo} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-chalk-2 hover:text-chalk">
          <span aria-hidden>↶</span> {m.game.undo}
        </button>
      </div>
    </main>
  );
}

export function Counting({ votes, fact, onDone }: { votes: number; fact?: string; onDone: () => void }) {
  const { m } = useI18n();
  const reduced = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(onDone, reduced ? 300 : 2800);
    return () => clearTimeout(t);
  }, [reduced]); // eslint-disable-line react-hooks/exhaustive-deps -- onDone només fa dispatch, que és estable

  return (
    <main aria-busy="true" className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10 text-center">
      <Hemicycle className="seats-count w-[min(90vw,640px)]" seat={() => ({ fill: "#f2f1ec" })} />
      <div className="grid gap-3">
        <h1 className="display text-[clamp(2.6rem,1.8rem+3vw,4.2rem)]">{m.game.counting.title}</h1>
        <p className="text-chalk-2">{format(m.game.counting.text, { n: votes })}</p>
        <div aria-hidden className="mx-auto mt-2 h-px w-48 overflow-hidden bg-chalk-3/40">
          <div className="count-bar h-full bg-chalk" />
        </div>
      </div>
      {fact && <p className="max-w-md font-serif text-lg italic text-chalk-2">{fact}</p>}
    </main>
  );
}
