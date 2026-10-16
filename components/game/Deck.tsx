"use client";

import { animate, m, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Answers } from "@/lib/match";
import type { Answer } from "@/lib/schema";
import { format, pad2 } from "@/lib/text";
import { useI18n } from "../I18n";
import type { Item } from "./Game";

const THRESH = 90; // px per comptar com a vot
const STRONG = 190; // px per a «molt»
const VALUES: Answer[] = [-2, -1, 0, 1, 2];
const SPRING = { type: "spring", stiffness: 420, damping: 32 } as const;
const OUT = { duration: 0.42, ease: [0.4, 0, 1, 1] } as const;

type Outcome = Answer | null | "go"; // null = saltada, "go" = continuar després d'una pausa
type CardHandle = { fling: (o: Outcome) => void };

const previewOf = (dx: number, dy: number): Answer | undefined =>
  dx > STRONG ? 2 : dx > THRESH ? 1 : dx < -STRONG ? -2 : dx < -THRESH ? -1 : dy < -THRESH ? 0 : undefined;

function decide(info: PanInfo, pause: boolean): Outcome | undefined {
  const { x: dx, y: dy } = info.offset;
  const { x: vx, y: vy } = info.velocity;
  if (Math.abs(dx) > THRESH || (Math.abs(vx) > 700 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))) {
    if (pause) return "go";
    return (Math.sign(dx) * (Math.abs(dx) > STRONG || Math.abs(vx) > 1800 ? 2 : 1)) as Answer;
  }
  if (dy < -THRESH || (vy < -700 && dy < -40)) return pause ? "go" : 0;
  return undefined;
}

// On queda una carta quan surt (i, en desfer, des d'on torna a entrar).
function exitFor(o: Outcome | undefined) {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const w = window.innerWidth + 240;
  if (o === null) return { x: 0, y: 160 };
  if (o === 0) return { x: 0, y: -window.innerHeight };
  if (o === "go" || o === undefined) return { x: w, y: 0 };
  return { x: Math.sign(o) * w, y: 0 };
}

export function Deck({
  item,
  upcoming,
  total,
  back,
  answers,
  stats,
  topics,
  onVote,
  onContinue,
  onUndo,
  canUndo,
}: {
  item: Item;
  upcoming: Item[];
  total: number;
  back: boolean;
  answers: Answers;
  stats: (Answer | null | undefined)[];
  topics: { id: string; name: string }[];
  onVote: (v: Answer | null) => void;
  onContinue: () => void;
  onUndo: () => void;
  canUndo: boolean;
}) {
  const { m: t } = useI18n();
  const card = useRef<CardHandle>(null);
  const [hint, setHint] = useState<Answer | undefined>();
  const keyOf = (it: Item) => (it.kind === "q" ? it.q.id : `pause-${it.n}`);
  const prev = item.kind === "q" ? answers[item.q.id] : undefined;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if ((e.key === "Enter" || e.key === " ") && target.closest("button, a, summary")) return;
      const c = card.current;
      if (!c) return;
      const k = e.key.toLowerCase();
      if (k === "z" || e.key === "Backspace") {
        if (canUndo) onUndo();
      } else if (item.kind === "pause") {
        if (!["enter", " ", "arrowright", "arrowleft", "arrowup"].includes(k)) return;
        c.fling("go");
      } else if (k >= "1" && k <= "5" && k.length === 1) c.fling(VALUES[Number(k) - 1]);
      else if (k === "arrowright") c.fling(e.shiftKey ? 2 : 1);
      else if (k === "arrowleft") c.fling(e.shiftKey ? -2 : -1);
      else if (k === "arrowup") c.fling(0);
      else if (k === "arrowdown" || k === "s") c.fling(null);
      else return;
      e.preventDefault();
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [item, canUndo, onUndo]);

  function done(o: Outcome) {
    setHint(undefined);
    if (o === "go") onContinue();
    else onVote(o);
  }

  return (
    <div className="relative flex w-full flex-1 flex-col items-center">
      <div className="relative -mt-5 h-[clamp(320px,50dvh,500px)] w-[min(90vw,400px)]">
        {upcoming
          .map((it, i) => ({ it, depth: i + 1 }))
          .reverse()
          .map(({ it, depth }) => (
            <div
              key={keyOf(it)}
              aria-hidden
              className={`absolute inset-0 rounded-[28px] transition-transform duration-500 ease-out-quint ${
                it.kind === "pause" ? "border border-chalk-3/50 bg-stage-2" : depth === 1 ? "bg-card-2" : "bg-card-3"
              }`}
              style={{ transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05})` }}
            />
          ))}
        <SwipeCard
          key={keyOf(item)}
          ref={card}
          item={item}
          total={total}
          enter={back ? exitFor(item.kind === "pause" ? "go" : prev) : null}
          prev={prev}
          topic={item.kind === "q" ? (topics.find((x) => x.id === item.q.topic)?.name ?? "") : ""}
          stats={stats}
          onDone={done}
          onPreview={setHint}
        />
      </div>

      {item.kind === "q" ? (
        <div role="group" aria-label={t.game.votePad} className="mt-7 flex items-start justify-center gap-1.5 sm:gap-3">
          {VALUES.map((v, i) => {
            const label = t.game.votes[String(v) as "0"];
            const size = Math.abs(v) === 2 ? "size-15" : Math.abs(v) === 1 ? "size-13" : "size-11";
            return (
              <div key={v} className="flex w-[4.1rem] flex-col items-center gap-1.5">
                <button
                  type="button"
                  aria-label={label}
                  aria-keyshortcuts={String(i + 1)}
                  onClick={() => card.current?.fling(v)}
                  className={`grid ${size} place-items-center rounded-full border transition duration-150 ease-out-quint active:scale-90 ${
                    hint === v
                      ? "scale-110 border-chalk bg-chalk text-stage"
                      : "border-chalk-3/60 bg-stage-2 text-chalk hover:border-chalk hover:bg-stage-3"
                  }`}
                >
                  <Glyph v={v} />
                </button>
                <span aria-hidden className={`text-center text-[0.68rem] leading-tight ${hint === v ? "text-chalk" : "text-chalk-2"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <button type="button" onClick={() => card.current?.fling("go")} className="btn mt-7 bg-chalk px-8 text-stage">
          {t.game.pause.continue} <span aria-hidden>→</span>
        </button>
      )}

      <div className="mt-auto flex w-[min(92vw,420px)] items-center justify-between gap-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-chalk-2 hover:text-chalk disabled:opacity-30"
        >
          <span aria-hidden>↶</span> {t.game.undo}
        </button>
        <p className="hidden text-center text-xs text-chalk-3 [@media(hover:hover)]:block">{t.game.intro.keys}</p>
        {item.kind === "q" ? (
          <button
            type="button"
            onClick={() => card.current?.fling(null)}
            className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-chalk-2 hover:text-chalk"
          >
            {t.game.skip} <span aria-hidden>↷</span>
          </button>
        ) : (
          <span className="w-16" />
        )}
      </div>
    </div>
  );
}

function SwipeCard({
  ref,
  item,
  total,
  enter,
  prev,
  topic,
  stats,
  onDone,
  onPreview,
}: {
  ref: React.Ref<CardHandle>;
  item: Item;
  total: number;
  enter: { x: number; y: number } | null;
  prev: Answer | null | undefined;
  topic: string;
  stats: (Answer | null | undefined)[];
  onDone: (o: Outcome) => void;
  onPreview: (a: Answer | undefined) => void;
}) {
  const { m: t } = useI18n();
  const reduced = useReducedMotion();
  const pause = item.kind === "pause";
  const x = useMotionValue(reduced ? 0 : (enter?.x ?? 0));
  const y = useMotionValue(reduced ? 0 : (enter?.y ?? 0));
  const opacity = useMotionValue(enter && !reduced ? 0 : 1);
  const rotate = useTransform(x, [-320, 320], [-16, 16]);
  const yes = useTransform(x, [24, THRESH], [0, 1]);
  const no = useTransform(x, [-THRESH, -24], [1, 0]);
  const meh = useTransform(y, [-THRESH, -24], [1, 0]);
  const [preview, setPreview] = useState<Answer | undefined>();
  const [flipped, setFlipped] = useState(false);
  const busy = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (!enter || reduced) return;
    animate(x, 0, SPRING);
    animate(y, 0, SPRING);
    animate(opacity, 1, { duration: 0.25 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- només en muntar

  function track() {
    if (busy.current || pause) return;
    const p = previewOf(x.get(), y.get());
    setPreview(p);
    onPreview(p);
  }
  useMotionValueEvent(x, "change", track);
  useMotionValueEvent(y, "change", track);

  async function fling(o: Outcome) {
    if (busy.current) return;
    busy.current = true;
    setFlipped(false);
    if (o !== "go") {
      setPreview(o ?? undefined);
      onPreview(o ?? undefined);
    }
    navigator.vibrate?.(8);
    if (!reduced) {
      const up = o === "go" && Math.abs(y.get()) > Math.abs(x.get());
      const dir = o === "go" ? (up ? undefined : Math.sign(x.get()) || 1) : undefined;
      const to = o === "go" ? (up ? { x: 0, y: -innerHeight } : { x: dir! * (innerWidth + 240), y: y.get() }) : exitFor(o);
      await Promise.all([
        animate(x, to.x, OUT),
        animate(y, to.y, OUT),
        o === null || o === 0 || (o === "go" && up) ? animate(opacity, 0, OUT) : Promise.resolve(),
      ]);
    }
    onDone(o);
  }
  useImperativeHandle(ref, () => ({ fling }));

  function onDragEnd(_: unknown, info: PanInfo) {
    const o = decide(info, pause);
    if (o !== undefined) return void fling(o);
    animate(x, 0, SPRING);
    animate(y, 0, SPRING);
  }

  const stamp = "pointer-events-none absolute rounded-lg border-[3px] px-3 py-1 font-sans text-lg font-extrabold uppercase tracking-wider";
  const strongYes = preview === 2;
  const strongNo = preview === -2;

  return (
    <m.div
      className="absolute inset-0"
      initial={enter ? false : { y: 14, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      transition={SPRING}
    >
      <m.div
        className="absolute inset-0 cursor-grab touch-none [perspective:1400px] active:cursor-grabbing"
        style={{ x, y, rotate, opacity }}
        drag={!flipped}
        dragMomentum={false}
        dragElastic={0.9}
        onDragEnd={onDragEnd}
      >
        {pause ? (
          <article className="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-chalk-3/60 bg-stage-2 p-6 text-chalk shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] sm:p-8">
            <p className="kicker text-chalk-2">{t.game.pause.kicker}</p>
            <h2 ref={heading} tabIndex={-1} className="mt-auto font-serif text-4xl italic outline-none">
              {t.game.pause.title}
            </h2>
            <p className="mt-4 font-serif text-[1.35rem] leading-snug">{item.fact}</p>
            <div className="mt-auto pt-6">
              <p className="text-sm text-chalk-2">{format(t.game.pause.stats, { n: stats.length })}</p>
              <dl className="mt-2 grid grid-cols-4 gap-2 border-t border-chalk-3/40 pt-3">
                {(
                  [
                    ["yes", stats.filter((a) => typeof a === "number" && a > 0).length],
                    ["no", stats.filter((a) => typeof a === "number" && a < 0).length],
                    ["neutral", stats.filter((a) => a === 0).length],
                    ["skipped", stats.filter((a) => a === null).length],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="grid gap-0.5">
                    <dt className="text-[0.68rem] uppercase tracking-wider text-chalk-2">{t.game.pause.labels[k]}</dt>
                    <dd className="num font-serif text-3xl leading-none">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ) : (
          <m.div
            className="relative size-full [transform-style:preserve-3d]"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 230, damping: 24 }}
          >
            <article
              inert={flipped}
              className="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] bg-card p-6 text-card-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] [backface-visibility:hidden] sm:p-8"
            >
              <span
                aria-hidden
                className="num pointer-events-none absolute -bottom-12 -right-4 select-none font-serif text-[12.5rem] italic leading-none text-transparent [-webkit-text-stroke:1.5px_#c9c6bd]"
              >
                {pad2(item.n)}
              </span>
              <p className="kicker relative text-card-ink-2">
                {format(t.game.card, { n: pad2(item.n) })} <span className="opacity-50">/ {pad2(total)}</span> · {topic}
              </p>
              <div className="relative flex flex-1 items-center">
                <h2
                  ref={heading}
                  tabIndex={-1}
                  className="font-serif text-[clamp(1.6rem,1.05rem+2.4vw,2.3rem)] leading-[1.08] tracking-[-0.018em] outline-none"
                >
                  {item.q.text}
                </h2>
              </div>
              <div className="relative flex items-end justify-between gap-3">
                <button
                  type="button"
                  aria-expanded={flipped}
                  onClick={() => setFlipped(true)}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  className="-ml-1 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold underline decoration-card-3 underline-offset-4 hover:decoration-card-ink"
                >
                  <span aria-hidden>↻</span> {t.game.why}
                </button>
                {prev !== undefined && (
                  <span className="text-right text-xs text-card-ink-2">
                    {format(t.game.previously, { v: prev === null ? t.game.skip : t.game.votes[String(prev) as "0"] })}
                  </span>
                )}
              </div>

              <m.span aria-hidden style={{ opacity: yes }} className={`${stamp} left-5 top-16 -rotate-12 border-card-ink ${strongYes ? "bg-card-ink text-card" : ""}`}>
                {t.game.votes[strongYes ? "2" : "1"]}
              </m.span>
              <m.span aria-hidden style={{ opacity: no }} className={`${stamp} right-5 top-16 rotate-12 border-card-ink ${strongNo ? "bg-card-ink text-card" : ""}`}>
                {t.game.votes[strongNo ? "-2" : "-1"]}
              </m.span>
              <m.span aria-hidden style={{ opacity: meh }} className={`${stamp} bottom-20 left-1/2 -translate-x-1/2 border-dashed border-card-ink`}>
                {t.game.votes["0"]}
              </m.span>
            </article>

            <article
              inert={!flipped}
              aria-hidden={!flipped}
              className="absolute inset-0 flex flex-col overflow-y-auto rounded-[28px] bg-card-2 p-6 text-card-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8"
            >
              <p className="kicker text-card-ink-2">
                {t.game.context} · {topic}
              </p>
              <p className="mt-5 font-serif text-[1.3rem] leading-snug">{item.q.context}</p>
              <button
                type="button"
                onClick={() => setFlipped(false)}
                onPointerDownCapture={(e) => e.stopPropagation()}
                className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-4 text-sm font-semibold underline decoration-card-3 underline-offset-4"
              >
                <span aria-hidden>↺</span> {t.game.backToCard}
              </button>
            </article>
          </m.div>
        )}
      </m.div>

      {!pause && (
        <>
          <m.span
            aria-hidden
            style={{ opacity: no }}
            className="pointer-events-none absolute right-full top-1/2 mr-8 hidden -translate-y-1/2 font-serif text-[9rem] italic leading-none text-chalk lg:block"
          >
            No
          </m.span>
          <m.span
            aria-hidden
            style={{ opacity: yes }}
            className="pointer-events-none absolute left-full top-1/2 ml-8 hidden -translate-y-1/2 font-serif text-[9rem] italic leading-none text-chalk lg:block"
          >
            Sí
          </m.span>
        </>
      )}
    </m.div>
  );
}

function Glyph({ v }: { v: Answer }) {
  if (v === 0) return <svg viewBox="0 0 24 24" className="size-3" aria-hidden><circle cx="12" cy="12" r="6" fill="currentColor" /></svg>;
  const d = Math.abs(v) === 2 ? "M5 6l6 6-6 6M12 6l6 6-6 6" : "M9 6l6 6-6 6";
  return (
    <svg viewBox="0 0 24 24" className={`size-6 ${v < 0 ? "-scale-x-100" : ""}`} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
