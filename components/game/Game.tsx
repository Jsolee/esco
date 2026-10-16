"use client";

import Link from "next/link";
import { domMax, LazyMotion, MotionConfig } from "motion/react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { GameData, GQuestion } from "@/lib/game";
import { inCircumscription, seededShuffle, type Answers } from "@/lib/match";
import type { Answer } from "@/lib/schema";
import { readJSON, readProvince, rememberProvince, writeJSON } from "@/lib/storage";
import { format, pad2 } from "@/lib/text";
import { Hemicycle } from "../Hemicycle";
import { useI18n } from "../I18n";
import { Wordmark } from "../Wordmark";
import { Deck } from "./Deck";
import { Results } from "./Results";
import { Counting, Intro, Priorities } from "./Stages";

export type Item = { kind: "q"; q: GQuestion; n: number } | { kind: "pause"; fact: string; n: number };
type Phase = "intro" | "play" | "priorities" | "counting" | "results";
type State = {
  v: 1;
  seed: number;
  province: string | null;
  phase: Phase;
  index: number; // posició dins de la baralla (afirmacions + pauses)
  answers: Answers;
  priorities: string[];
  back: boolean; // l'últim moviment ha estat enrere
};
type Action =
  | { type: "province"; id: string }
  | { type: "start" }
  | { type: "vote"; id: string; value: Answer | null; total: number }
  | { type: "next"; total: number }
  | { type: "goto"; index: number }
  | { type: "phase"; phase: Phase }
  | { type: "priority"; topic: string }
  | { type: "restart"; seed: number };

const newSeed = () => Math.floor(Math.random() * 2 ** 31);
const fresh = (province: string | null): State => ({
  v: 1,
  seed: newSeed(),
  province,
  phase: "intro",
  index: 0,
  answers: {},
  priorities: [],
  back: false,
});
const advance = (s: State, total: number): State =>
  s.index + 1 >= total ? { ...s, phase: "priorities", back: false } : { ...s, index: s.index + 1, back: false };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "province":
      return { ...s, province: a.id };
    case "start":
      return { ...s, phase: "play", index: 0, back: false };
    case "vote":
      return advance({ ...s, answers: { ...s.answers, [a.id]: a.value } }, a.total);
    case "next":
      return advance(s, a.total);
    case "goto":
      return { ...s, phase: "play", index: a.index, back: a.index < s.index || s.phase !== "play" };
    case "phase":
      return { ...s, phase: a.phase, back: false };
    case "priority":
      return {
        ...s,
        priorities: s.priorities.includes(a.topic) ? s.priorities.filter((t) => t !== a.topic) : [...s.priorities, a.topic],
      };
    case "restart":
      return { ...fresh(s.province), seed: a.seed };
  }
}

function buildItems(questions: GQuestion[], facts: string[], seed: number): Item[] {
  const order = seededShuffle(questions, seed);
  const stops = order.length >= 12 ? [Math.round(order.length / 3), Math.round((2 * order.length) / 3)] : [];
  return order.flatMap((q, i): Item[] => {
    const k = stops.indexOf(i + 1);
    const card: Item = { kind: "q", q, n: i + 1 };
    return k >= 0 && facts[k] ? [card, { kind: "pause", fact: facts[k], n: i + 1 }] : [card];
  });
}

const tokenOf = (s: State) =>
  s.phase === "play" ? `v${s.index + 1}` : s.phase === "intro" ? "inici" : s.phase === "priorities" ? "prioritats" : "resultat";

export function Game({ data }: { data: GameData }) {
  const { m, locale } = useI18n();
  const key = `esco:${data.electionId}`;
  const [s, dispatch] = useReducer(reducer, null, () => {
    const saved = readJSON<State>(key);
    if (saved?.v === 1) return saved.phase === "counting" ? { ...saved, phase: "results" as const } : saved;
    const p = readProvince();
    return fresh(p && data.provinces.some((x) => x.id === p) ? p : null);
  });
  const [live, setLive] = useState("");

  const items = useMemo(() => buildItems(data.questions, data.facts, s.seed), [data, s.seed]);
  const order = useMemo(() => items.flatMap((it) => (it.kind === "q" ? [it.q] : [])), [items]);
  const candidacies = useMemo(
    () => (s.province ? seededShuffle(data.candidacies.filter((c) => inCircumscription(c, s.province!)), s.seed + 1) : []),
    [data, s.province, s.seed],
  );

  useEffect(() => writeJSON(key, s), [key, s]);

  // El pas va després del # (no arriba mai al servidor): el gest d'enrere del mòbil desfà l'últim vot.
  const token = tokenOf(s);
  const popped = useRef(false);
  const first = useRef(true);
  useEffect(() => {
    const h = `#${token}`;
    const replace = first.current || popped.current;
    first.current = popped.current = false;
    if (location.hash !== h) history[replace ? "replaceState" : "pushState"](null, "", h);
  }, [token]);
  useEffect(() => {
    const onPop = () => {
      popped.current = true;
      const t = location.hash.slice(1);
      const v = /^v(\d+)$/.exec(t);
      if (v && Number(v[1]) <= items.length) dispatch({ type: "goto", index: Number(v[1]) - 1 });
      else if (t === "inici") dispatch({ type: "phase", phase: "intro" });
      else if (t === "prioritats") dispatch({ type: "phase", phase: "priorities" });
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, [items.length]);

  const item = items[s.index];
  const total = items.length;
  const qDone = item ? (item.kind === "q" ? item.n - 1 : item.n) : order.length;

  function vote(value: Answer | null) {
    if (item?.kind !== "q") return;
    setLive(value === null ? m.game.live.skipped : format(m.game.live.voted, { v: m.game.votes[String(value) as "0"] }));
    dispatch({ type: "vote", id: item.q.id, value, total });
  }
  function undo() {
    if (s.phase === "priorities") return dispatch({ type: "goto", index: total - 1 });
    let i = s.index - 1;
    if (items[i]?.kind === "pause") i--;
    if (i < 0) dispatch({ type: "phase", phase: "intro" });
    else dispatch({ type: "goto", index: i });
  }

  if (s.phase === "results")
    return (
      <Results
        data={data}
        order={order}
        answers={s.answers}
        priorities={s.priorities}
        candidacies={candidacies}
        onRestart={() => dispatch({ type: "restart", seed: newSeed() })}
        onFirst={() => dispatch({ type: "goto", index: 0 })}
      />
    );

  const Q = order.length;
  const current = s.phase === "play" && item?.kind === "q" ? item.n - 1 : -1;

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-stage text-chalk">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_-10%,#2a2926_0%,transparent_60%)]"
          />
          <header className="relative z-20 flex items-center justify-between gap-3 px-4 pt-[max(10px,env(safe-area-inset-top))] sm:px-6">
            <Link href={`/${locale}`} aria-label={m.nav.home} className="inline-flex min-h-11 items-center">
              <Wordmark className="text-[1.35rem]" />
            </Link>
            {s.phase === "play" && (
              <p className="kicker num text-chalk-2" aria-hidden>
                {pad2(item?.kind === "q" ? item.n : qDone)} <span className="text-chalk-3">/ {pad2(Q)}</span>
              </p>
            )}
            {data.fictional ? (
              <span className="kicker rounded-full border border-dashed border-chalk-3 px-2.5 py-1 text-[0.68rem] text-chalk-2">
                {m.game.fictional}
              </span>
            ) : (
              <span />
            )}
          </header>

          {s.phase === "intro" && (
            <Intro
              data={data}
              province={s.province}
              count={Q}
              onProvince={(id) => {
                rememberProvince(id);
                dispatch({ type: "province", id });
              }}
              onStart={() => dispatch({ type: "start" })}
            />
          )}

          {s.phase === "play" && item && (
            <main className="relative flex flex-1 flex-col items-center">
              <Hemicycle
                className="pointer-events-none mt-1 h-auto max-h-[17dvh] w-[min(88vw,520px)] shrink-0"
                label={format(m.game.progress, { n: qDone, total: Q })}
                seat={(_, rank) => {
                  const k = Math.min(Q - 1, Math.floor((rank * Q) / 350));
                  const start = Math.ceil((k * 350) / Q);
                  const a = s.answers[order[k].id];
                  if (k === current) return { fill: "#f2f1ec", cls: "seat-next" };
                  if (a === null) return { fill: "#8e8c85", stroke: true };
                  if (typeof a === "number")
                    return { fill: "#f2f1ec", opacity: [0.55, 0.8, 1][Math.abs(a)], cls: "seat-pop", delay: (rank - start) * 9 };
                  return { fill: "#f2f1ec", opacity: 0.1 };
                }}
              />
              <Deck
                key={s.seed}
                item={item}
                upcoming={items.slice(s.index + 1, s.index + 3)}
                total={Q}
                back={s.back}
                answers={s.answers}
                stats={order.slice(0, qDone).map((q) => s.answers[q.id])}
                topics={data.topics}
                onVote={vote}
                onContinue={() => dispatch({ type: "next", total })}
                onUndo={undo}
                canUndo={s.index > 0}
              />
            </main>
          )}

          {s.phase === "priorities" && (
            <Priorities
              topics={data.topics}
              questions={data.questions}
              selected={s.priorities}
              onToggle={(topic) => dispatch({ type: "priority", topic })}
              onUndo={undo}
              onGo={() => dispatch({ type: "phase", phase: "counting" })}
            />
          )}

          {s.phase === "counting" && (
            <Counting
              votes={Object.values(s.answers).filter((a) => typeof a === "number").length}
              fact={data.facts[2]}
              onDone={() => dispatch({ type: "phase", phase: "results" })}
            />
          )}

          <p className="sr-only" aria-live="polite">
            {live}
          </p>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
