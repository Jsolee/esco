"use client";

import Link from "next/link";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { achievementsOf, progressOf, type Achievement } from "@/lib/achievements";
import { balanceOf, needFor, remainingOf, TOKENS, type Alloc } from "@/lib/budget";
import type { GameData, GQuestion } from "@/lib/game";
import { FILL, RANK, SEATS } from "@/lib/hemicycle";
import { inCircumscription, seededShuffle, type Answers } from "@/lib/match";
import type { Answer } from "@/lib/schema";
import { readJSON, readProvince, rememberProvince, writeJSON } from "@/lib/storage";
import { format, pad2 } from "@/lib/text";
import { useI18n } from "../I18n";
import type { ChamberHandle, ChamberMode } from "../three/Chamber";
import { Stage3D } from "../three/Stage3D";
import { Wordmark } from "../Wordmark";
import { Deck } from "./Deck";
import { BudgetChip } from "./Funding";
import { Gavel, RoundSplash, Toasts } from "./Overlays";
import { Results } from "./Results";
import { Counting, Intro, SoundToggle, Tokens } from "./Stages";

export type Item = { kind: "q"; q: GQuestion; n: number } | { kind: "pause"; fact: string; n: number };
type Phase = "intro" | "play" | "priorities" | "counting" | "results";
type State = {
  v: 3;
  seed: number;
  province: string | null;
  phase: Phase;
  index: number; // posició dins de la baralla (afirmacions + finals de ronda)
  answers: Answers;
  tokens: Record<string, number>; // fitxes d'influència per tema
  alloc: Alloc; // d'on ha sortit el finançament de cada proposta aprovada
  read: string[]; // afirmacions de les quals s'ha llegit el context
  ach: Achievement[];
  back: boolean; // l'últim moviment ha estat enrere
};
type Action =
  | { type: "province"; id: string }
  | { type: "start" }
  | { type: "vote"; id: string; value: Answer | null; total: number; from?: Record<string, number> }
  | { type: "next"; total: number }
  | { type: "goto"; index: number }
  | { type: "phase"; phase: Phase }
  | { type: "token"; topic: string; delta: 1 | -1 }
  | { type: "read"; id: string }
  | { type: "unlock"; ids: Achievement[] }
  | { type: "restart"; seed: number };

const newSeed = () => Math.floor(Math.random() * 2 ** 31);
const fresh = (province: string | null): State => ({
  v: 3,
  seed: newSeed(),
  province,
  phase: "intro",
  index: 0,
  answers: {},
  tokens: {},
  alloc: {},
  read: [],
  ach: [],
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
    case "vote": {
      const alloc = { ...s.alloc };
      if (a.from) alloc[a.id] = a.from;
      else delete alloc[a.id];
      return advance({ ...s, answers: { ...s.answers, [a.id]: a.value }, alloc }, a.total);
    }
    case "next":
      return advance(s, a.total);
    case "goto":
      return { ...s, phase: "play", index: a.index, back: a.index < s.index || s.phase !== "play" };
    case "phase":
      return { ...s, phase: a.phase, back: false };
    case "token": {
      const used = Object.values(s.tokens).reduce((x, y) => x + y, 0);
      const cur = s.tokens[a.topic] ?? 0;
      if ((a.delta > 0 && used >= TOKENS) || (a.delta < 0 && cur === 0)) return s;
      return { ...s, tokens: { ...s.tokens, [a.topic]: cur + a.delta } };
    }
    case "read":
      return s.read.includes(a.id) ? s : { ...s, read: [...s.read, a.id] };
    case "unlock":
      return { ...s, ach: [...s.ach, ...a.ids.filter((x) => !s.ach.includes(x))] };
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
const MODE: Record<Phase, ChamberMode> = { intro: "idle", play: "play", priorities: "idle", counting: "count", results: "reveal" };
const YOU = FILL.find((i) => SEATS[i].row === 6)!;

export function Game({ data }: { data: GameData }) {
  const { m, locale } = useI18n();
  const key = `esco:${data.electionId}`;
  const [s, dispatch] = useReducer(reducer, null, (): State => {
    type Old = Omit<State, "v" | "tokens" | "alloc" | "read" | "ach"> & { v: 1 | 2; priorities?: string[]; read?: string[]; ach?: Achievement[] };
    const saved = readJSON<State | Old>(key);
    if (saved && (saved.v === 1 || saved.v === 2 || saved.v === 3)) {
      // Les partides antigues passen els temes ×2 a dues fitxes cadascun.
      const old = saved as Old;
      const st: State =
        saved.v === 3
          ? (saved as State)
          : { read: [], ach: [], ...old, v: 3, alloc: {}, tokens: Object.fromEntries((old.priorities ?? []).map((t) => [t, 2])) };
      // Si les afirmacions han canviat des que es va desar (un desplegament nou), la partida ja no quadra: es comença de nou.
      const ids = new Set(data.questions.map((q) => q.id));
      const stale =
        Object.keys(st.answers).some((id) => !ids.has(id)) || st.index >= buildItems(data.questions, data.facts, st.seed).length;
      if (!stale) return st.phase === "counting" ? { ...st, phase: "results" } : st;
    }
    const p = readProvince();
    return fresh(p && data.provinces.some((x) => x.id === p) ? p : null);
  });
  const chamber = useRef<ChamberHandle>(null);
  const [live, setLive] = useState("");
  const [gavel, setGavel] = useState<null | "open" | "close">(null);
  const [toasts, setToasts] = useState<Achievement[]>([]);

  const items = useMemo(() => buildItems(data.questions, data.facts, s.seed), [data, s.seed]);
  const order = useMemo(() => items.flatMap((it) => (it.kind === "q" ? [it.q] : [])), [items]);
  const orderIds = useMemo(() => order.map((q) => q.id), [order]);
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
      const v = /^v([1-9]\d*)$/.exec(t);
      if (v && Number(v[1]) <= items.length) dispatch({ type: "goto", index: Number(v[1]) - 1 });
      else if (t === "inici") dispatch({ type: "phase", phase: "intro" });
      else if (t === "prioritats") dispatch({ type: "phase", phase: "priorities" });
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, [items.length]);

  const Q = order.length;
  const item = items[s.index];
  const total = items.length;
  const qDone = item ? (item.kind === "q" ? item.n - 1 : item.n) : Q;
  const round = 1 + items.slice(0, s.index).filter((it) => it.kind === "pause").length;
  const rounds = 1 + items.filter((it) => it.kind === "pause").length;
  const { run: streak } = progressOf(orderIds, s.answers);

  // Cada afirmació té un bloc d'escons; el bloc s'encén quan la votes.
  const batchOf = useMemo(() => SEATS.map((_, i) => Math.min(Q - 1, Math.floor((RANK[i] * Q) / SEATS.length))), [Q]);
  const batches = useMemo(() => order.map((_, k) => batchOf.flatMap((b, i) => (b === k ? [i] : []))), [order, batchOf]);
  const lit = useMemo(
    () =>
      s.phase === "counting"
        ? batchOf.map(() => 0.15)
        : batchOf.map((k) => {
            const a = s.answers[order[k].id];
            return a === undefined ? 0.1 : a === null ? 0.24 : [0.62, 0.84, 1][Math.abs(a)];
          }),
    [batchOf, order, s.answers, s.phase],
  );
  const next = s.phase === "play" && item?.kind === "q" ? batches[item.n - 1] : undefined;

  function unlock(answers: Answers, read: number, finished: boolean) {
    const ids = achievementsOf(orderIds, answers, read, finished).filter((a) => !s.ach.includes(a));
    if (!ids.length) return;
    dispatch({ type: "unlock", ids });
    setToasts((t) => [...t, ...ids.filter((x) => !t.includes(x))]);
  }

  const balance = balanceOf(data.questions, s.answers, s.alloc);
  const sources = useMemo(() => {
    const rem = remainingOf(data.funding, s.alloc, item?.kind === "q" ? item.q.id : undefined);
    return data.funding.map((f) => ({ ...f, remaining: rem[f.id] }));
  }, [data.funding, s.alloc, item]);
  const need = (v: Answer) =>
    item?.kind === "q" && data.funding.length ? needFor(item.q, v, data.questions, s.answers, s.alloc) : 0;

  function vote(value: Answer | null, from?: Record<string, number>) {
    if (item?.kind !== "q") return;
    // Amb el número, dos vots iguals seguits no deixen el text igual i el lector de pantalla els torna a anunciar.
    setLive(`${item.n}. ${value === null ? m.game.live.skipped : format(m.game.live.voted, { v: m.game.votes[String(value) as "0"] })}`);
    const answers = { ...s.answers, [item.q.id]: value };
    dispatch({ type: "vote", id: item.q.id, value, total, from });
    if (value !== null) chamber.current?.pulse(batches[item.n - 1]);
    unlock(answers, s.read.length, s.index + 1 >= total);
  }
  function read(id: string) {
    if (s.read.includes(id)) return;
    dispatch({ type: "read", id });
    unlock(s.answers, s.read.length + 1, false);
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
        tokens={s.tokens}
        alloc={s.alloc}
        candidacies={candidacies}
        onRestart={() => dispatch({ type: "restart", seed: newSeed() })}
        onFirst={() => dispatch({ type: "goto", index: 0 })}
      />
    );

  const splash = s.phase === "play" && item?.kind === "q" && !s.back && (item.n === 1 || items[s.index - 1]?.kind === "pause");

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-stage text-chalk">
      <Stage3D
        handle={chamber}
        mode={MODE[s.phase]}
        lit={lit}
        next={next}
        you={s.phase === "intro" ? YOU : undefined}
        youLabel={s.phase === "intro" ? m.landing.yourSeat : undefined}
        fallbackClass="mt-[9dvh] h-auto w-[min(92vw,640px)] self-start"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_15%,transparent_35%,rgba(12,12,11,0.92)_100%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55dvh] bg-gradient-to-t from-stage via-stage/80 to-transparent" />
      {/* Darrere dels textos llargs, el ple s'apaga una mica perquè es llegeixin bé. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-stage/60 transition-opacity duration-700 ${s.phase === "priorities" ? "opacity-100" : "opacity-0"}`}
      />

      {/* Els escons encesos no han de tapar el comptador ni els botons de la capçalera. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-stage via-stage/75 to-transparent" />
      <header className="relative z-20 grid gap-2 px-4 pt-[max(10px,env(safe-area-inset-top))] sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/${locale}`} aria-label={m.nav.home} className="inline-flex min-h-11 items-center">
            <Wordmark className="text-[1.35rem]" />
          </Link>
          {s.phase === "play" && (
            <p className="kicker num whitespace-nowrap text-chalk-2" aria-hidden>
              {/* En mòbil no hi cap: la barra de sota ja separa les rondes. */}
              <span className="hidden sm:inline">
                {format(m.game.round, { n: round })} <span className="text-chalk-3">·</span>{" "}
              </span>
              {pad2(item?.kind === "q" ? item.n : qDone)}
              <span className="text-chalk-3">/{pad2(Q)}</span>
            </p>
          )}
          <div className="flex items-center gap-2">
            {data.funding.length > 0 && (s.phase === "play" || s.phase === "priorities") && (
              <BudgetChip value={balance} label={m.game.budget} />
            )}
            {s.phase === "play" && streak >= 2 && (
              <span key={streak} className="streak-pop kicker inline-flex items-center gap-1 rounded-full bg-chalk px-2.5 py-1 text-stage" title={m.game.streak}>
                <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
                  <path d="M8 1c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-7z" fill="currentColor" />
                </svg>
                ×{streak}
              </span>
            )}
            <SoundToggle compact />
            {data.fictional && (
              <span className="kicker rounded-full border border-dashed border-chalk-3 px-2.5 py-1 text-[0.6875rem] text-chalk-2">{m.start.fictional}</span>
            )}
          </div>
        </div>
        {s.phase === "play" && (
          <div aria-hidden className="flex h-1.5 gap-[3px]">
            {order.map((q, k) => {
              const a = s.answers[q.id];
              const cur = item?.kind === "q" && item.n - 1 === k;
              return (
                <span
                  key={q.id}
                  className={`flex-1 rounded-full transition-colors duration-500 ${
                    cur ? "bg-chalk" : a === null ? "bg-chalk-3/40" : a !== undefined ? "bg-chalk/80" : "bg-chalk-3/20"
                  } ${(k + 1) % 8 === 0 && k + 1 < Q ? "mr-1.5" : ""}`}
                />
              );
            })}
          </div>
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
          onStart={() => setGavel("open")}
        />
      )}

      {s.phase === "play" && item && (
        <main className="relative z-10 flex flex-1 flex-col items-center justify-end pt-[16dvh]">
          {splash && <RoundSplash key={round} round={round} total={rounds} />}
          <Deck
            key={s.seed}
            item={item}
            upcoming={items.slice(s.index + 1, s.index + 3)}
            total={Q}
            round={round}
            back={s.back}
            delay={splash ? 1.55 : 0}
            answers={s.answers}
            stats={order.slice(0, qDone).map((q) => s.answers[q.id])}
            ach={s.ach}
            topics={data.topics}
            onVote={vote}
            onContinue={() => dispatch({ type: "next", total })}
            onUndo={undo}
            canUndo={s.index > 0}
            onImpact={(v) => chamber.current?.shake(v === null ? 0.3 : Math.abs(v) === 2 ? 1.7 : 1)}
            onRead={read}
            needFor={need}
            sources={sources}
          />
        </main>
      )}

      {s.phase === "priorities" && (
        <div className="relative z-10 flex flex-1 flex-col">
          <Tokens
            topics={data.topics}
            questions={data.questions}
            tokens={s.tokens}
            onChange={(topic, delta) => dispatch({ type: "token", topic, delta })}
            onUndo={undo}
            onGo={() => setGavel("close")}
          />
        </div>
      )}

      {s.phase === "counting" && (
        <div className="relative z-10 flex flex-1 flex-col">
          <Counting
            votes={Object.values(s.answers).filter((a) => typeof a === "number").length}
            fact={data.facts[2]}
            onDone={() => dispatch({ type: "phase", phase: "results" })}
          />
        </div>
      )}

      {gavel && (
        <Gavel
          label={gavel === "open" ? m.game.gavelOpen : m.game.gavelClose}
          onImpact={() => chamber.current?.shake(2.4)}
          onDone={() => {
            setGavel(null);
            dispatch(gavel === "open" ? { type: "start" } : { type: "phase", phase: "counting" });
          }}
        />
      )}
      <Toasts items={toasts} onDone={(id) => setToasts((t) => t.filter((x) => x !== id))} />
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </div>
  );
}
