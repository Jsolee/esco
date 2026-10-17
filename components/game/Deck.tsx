"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Achievement } from "@/lib/achievements";
import { Draggable, gsap, reducedMotion, sfx, SplitText, useGSAP, useReducedMotion } from "@/lib/fx";
import { RED_LINES, type Answers } from "@/lib/match";
import type { Answer } from "@/lib/schema";
import { format, pad2 } from "@/lib/text";
import { useI18n } from "../I18n";
import type { Item } from "@/lib/gameState";
import { CostTag, FundingSheet, type FundResult, type FundSource } from "./Funding";
import { RoundComplete } from "./Overlays";

const THRESH = 90; // px per comptar com a vot
const VALUES: Answer[] = [-1, 0, 1]; // no, abstenció, sí
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export type Outcome = Answer | null | "go"; // null = saltada, "go" = continuar després d'una ronda
type CardHandle = { fling: (o: Outcome) => void; busy?: () => boolean; flipped?: () => boolean };

const previewOf = (dx: number, dy: number): Answer | undefined =>
  dx > THRESH ? 1 : dx < -THRESH ? -1 : dy < -THRESH ? 0 : undefined;

function decide(dx: number, dy: number, vx: number, vy: number): Answer | undefined {
  if (Math.abs(dx) > THRESH || (Math.abs(vx) > 700 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)))
    return Math.sign(dx) as Answer;
  if (dy < -THRESH || (vy < -700 && dy < -40)) return 0;
  return undefined;
}

export function Deck({
  item,
  upcoming,
  total,
  round,
  back,
  delay,
  answers,
  stats,
  ach,
  topics,
  onVote,
  onContinue,
  onUndo,
  canUndo,
  onImpact,
  onRead,
  needFor,
  sources,
  redIds,
}: {
  item: Item;
  upcoming: Item[];
  total: number;
  round: number;
  back: boolean;
  delay: number; // s d'espera abans de repartir la carta (rètol de ronda)
  answers: Answers;
  stats: (Answer | null | undefined)[];
  ach: Achievement[];
  topics: { id: string; name: string }[];
  onVote: (v: Answer | null, from?: Record<string, number>, red?: boolean) => void;
  onContinue: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onImpact: (v: Answer | null) => void;
  onRead: (qid: string) => void;
  needFor: (v: Answer) => number; // punts que cal finançar si votes `v`
  sources: FundSource[];
  redIds: string[]; // línies vermelles ja marcades
}) {
  const { m: t } = useI18n();
  const card = useRef<CardHandle>(null);
  const [fund, setFund] = useState<{ need: number; resolve: (r: FundResult) => void } | null>(null);
  const onFund = (need: number) => new Promise<FundResult>((resolve) => setFund({ need, resolve }));
  const pad = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState<Answer | undefined>();
  const keyOf = (it: Item) => (it.kind === "q" ? it.q.id : `pause-${it.n}`);
  const prev = item.kind === "q" ? answers[item.q.id] : undefined;
  // Línia vermella de la carta actual: la que ja tenia, o la que s'hi acaba de marcar.
  const [redToggle, setRedToggle] = useState<{ id: string; on: boolean } | null>(null);
  const qid = item.kind === "q" ? item.q.id : null;
  const red = qid !== null && (redToggle?.id === qid ? redToggle.on : redIds.includes(qid));
  const redLeft = RED_LINES - redIds.filter((id) => id !== qid).length;
  const toggleRed = () => qid && (red || redLeft > 0) && setRedToggle({ id: qid, on: !red });
  // Desfer mentre la carta vola deixaria la seva animació votant sobre la carta que torna.
  const undo = () => {
    if (canUndo && !card.current?.busy?.()) onUndo();
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (fund || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if ((e.key === "Enter" || e.key === " ") && target?.closest("button, a, summary")) return;
      const c = card.current;
      if (!c) return;
      const k = e.key.toLowerCase();
      if (k === "z" || e.key === "Backspace") {
        if (canUndo && !c.busy?.()) onUndo();
      } else if (item.kind === "pause") {
        if (!["enter", " ", "arrowright", "arrowleft", "arrowup"].includes(k)) return;
        c.fling("go");
      } else if (c.flipped?.()) return; // amb el context a la vista, les fletxes desplacen el text, no voten
      else if (k >= "1" && k <= "3" && k.length === 1) c.fling(VALUES[Number(k) - 1]);
      else if (k === "arrowright") c.fling(1);
      else if (k === "arrowleft") c.fling(-1);
      else if (k === "r") {
        if (qid && (red || redLeft > 0)) setRedToggle({ id: qid, on: !red });
      }
      else if (k === "arrowup") c.fling(0);
      else if (k === "arrowdown" || k === "s") c.fling(null);
      else return;
      e.preventDefault();
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [item, canUndo, onUndo, fund, qid, red, redLeft]);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(".pad-btn", { y: 30, opacity: 0, stagger: 0.05, duration: 0.5, ease: "back.out(2)", delay: 0.2 });
    },
    { scope: pad },
  );

  function done(o: Outcome, from?: Record<string, number>) {
    setHint(undefined);
    if (o === "go") onContinue();
    else onVote(o, from, red && (o === 1 || o === -1));
  }

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative h-[clamp(300px,48dvh,480px)] w-[min(90vw,400px)] [perspective:1400px]">
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
        {item.kind === "pause" ? (
          <RoundComplete
            key={keyOf(item)}
            ref={card as React.Ref<{ fling: () => void }>}
            round={round}
            fact={item.fact}
            stats={stats}
            ach={ach}
            onDone={() => done("go")}
          />
        ) : (
          <SwipeCard
            key={keyOf(item)}
            ref={card}
            item={item}
            total={total}
            enter={back ? (prev ?? "go") : undefined}
            delay={delay}
            prev={prev}
            topic={topics.find((x) => x.id === item.q.topic)?.name ?? ""}
            onDone={done}
            onPreview={setHint}
            onImpact={onImpact}
            onRead={() => onRead(item.q.id)}
            needFor={needFor}
            onFund={onFund}
            red={red}
          />
        )}
      </div>
      {fund && (
        <FundingSheet
          need={fund.need}
          sources={sources}
          onResolve={(r) => {
            fund.resolve(r);
            setFund(null);
          }}
        />
      )}

      <div ref={pad} className="w-full">
        {item.kind === "q" ? (
          <>
          <div role="group" aria-label={t.game.votePad} className="mt-7 flex items-start justify-center gap-1.5 sm:gap-3">
            {VALUES.map((v, i) => {
              const label = t.game.ballot[String(v) as "0"];
              const size = v === 0 ? "size-12" : "size-15";
              return (
                <div key={v} className="pad-btn flex w-[5.2rem] flex-col items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={label}
                    aria-keyshortcuts={String(i + 1)}
                    onClick={() => card.current?.fling(v)}
                    className={`grid ${size} place-items-center rounded-full border backdrop-blur transition duration-150 ease-out-quint active:scale-90 ${
                      hint === v
                        ? "scale-115 border-chalk bg-chalk text-stage shadow-[0_0_40px_rgba(242,241,236,0.45)]"
                        : "border-chalk-3/60 bg-stage-2/80 text-chalk hover:border-chalk hover:bg-stage-3"
                    }`}
                  >
                    <Glyph v={v} />
                  </button>
                  <span aria-hidden className={`text-center text-[0.8rem] font-semibold leading-tight ${hint === v ? "text-chalk" : "text-chalk-2"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                aria-pressed={red}
                aria-keyshortcuts="R"
                onClick={toggleRed}
                disabled={!red && redLeft <= 0}
                title={t.game.red.hint}
                className={`pad-btn inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-35 ${
                  red ? "border-chalk bg-chalk text-stage" : "border-dashed border-chalk-3 text-chalk-2 hover:border-chalk hover:text-chalk"
                }`}
              >
                <span aria-hidden>⊘</span>
                {red ? t.game.red.on : t.game.red.mark}
                <span className="font-normal normal-case tracking-normal opacity-80">
                  · {redLeft > 0 || red ? format(t.game.red.left, { n: red ? redLeft - 1 : redLeft }) : t.game.red.none}
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="mt-7 flex justify-center">
            <button type="button" onClick={() => card.current?.fling("go")} className="btn bg-chalk px-8 text-stage">
              {t.game.pause.continue} <span aria-hidden>→</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex w-[min(92vw,420px)] items-center justify-between gap-4 pb-[max(14px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-chalk-2 hover:text-chalk disabled:opacity-30"
        >
          <span aria-hidden>↶</span> {t.game.undo}
        </button>
        <p className="hidden text-center text-[0.7rem] text-chalk-3 [@media(hover:hover)]:block">{t.game.intro.keys}</p>
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
  delay,
  prev,
  topic,
  onDone,
  onPreview,
  onImpact,
  onRead,
  needFor,
  onFund,
  red = false,
}: {
  ref: React.Ref<CardHandle>;
  item: Extract<Item, { kind: "q" }>;
  total: number;
  enter: Outcome | undefined; // en desfer: d'on torna la carta
  delay: number;
  prev: Answer | null | undefined;
  topic: string;
  onDone: (o: Outcome, from?: Record<string, number>) => void;
  onPreview: (a: Answer | undefined) => void;
  onImpact: (v: Answer | null) => void;
  onRead: () => void;
  needFor: (v: Answer) => number;
  onFund: (need: number) => Promise<FundResult>;
  red?: boolean;
}) {
  const { m: t } = useI18n();
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const draggable = useRef<Draggable | null>(null);
  const busy = useRef(false);
  const preview = useRef<Answer | undefined>(undefined);
  const vel = useRef({ x: 0, y: 0, lx: 0, ly: 0, t: 0 });
  const from = useRef<Record<string, number> | undefined>(undefined);
  const [, setLabel] = useState<Answer | undefined>();
  const [flipped, setFlipped] = useState(false);

  const q = (sel: string) => wrap.current!.querySelector<HTMLElement>(sel)!;

  function update(x: number, y: number) {
    gsap.set(drag.current, { rotation: Math.max(-18, Math.min(18, x / 16)) });
    const yes = clamp01((x - 24) / (THRESH - 24));
    const no = clamp01((-x - 24) / (THRESH - 24));
    const meh = Math.abs(x) < THRESH ? clamp01((-y - 24) / (THRESH - 24)) : 0;
    gsap.set(q(".stamp-yes"), { opacity: yes, scale: 1.35 - yes * 0.35 });
    gsap.set(q(".stamp-no"), { opacity: no, scale: 1.35 - no * 0.35 });
    gsap.set(q(".stamp-meh"), { opacity: meh, scale: 1.35 - meh * 0.35 });
    gsap.set(q(".cue-yes"), { opacity: yes, x: (1 - yes) * -30 });
    gsap.set(q(".cue-no"), { opacity: no, x: (1 - no) * 30 });
    gsap.set(q(".gloss"), {
      backgroundPosition: `${50 - x / 5}% ${50 - y / 5}%`,
      opacity: 0.25 + Math.min(Math.abs(x) + Math.abs(y), 240) / 480,
    });
    const p = previewOf(x, y);
    if (p !== preview.current) {
      preview.current = p;
      setLabel(p);
      onPreview(p);
      if (p !== undefined) sfx.tick();
    }
  }

  useGSAP(
    () => {
      heading.current?.focus({ preventScroll: true });
      gsap.set([q(".stamp-yes"), q(".stamp-no"), q(".stamp-meh")], { opacity: 0 });
      gsap.set(q(".stamp-yes"), { rotation: -12 });
      gsap.set(q(".stamp-no"), { rotation: 12 });
      gsap.set(q(".stamp-meh"), { xPercent: -50 });

      if (!reduced) {
        if (enter !== undefined) {
          const d = enter === "go" ? 1 : enter === null ? 0 : Math.sign(enter);
          gsap.from(drag.current, {
            x: d * (innerWidth + 200),
            y: enter === 0 ? -innerHeight : enter === null ? 160 : 0,
            rotation: d * 30,
            opacity: enter === null || enter === 0 ? 0 : 1,
            duration: 0.6,
            ease: "power3.out",
          });
        } else {
          gsap.from(tilt.current, { y: 60, scale: 0.9, rotationX: 22, opacity: 0, duration: 0.75, delay, ease: "back.out(1.5)" });
          const split = SplitText.create(heading.current, { type: "words", mask: "words" });
          gsap.from(split.words, { yPercent: 110, duration: 0.75, stagger: 0.035, delay: delay + 0.15, ease: "expo.out" });
          gsap.from(q(".card-num"), { xPercent: 30, opacity: 0, duration: 1.1, delay: delay + 0.1, ease: "expo.out" });
        }
      }

      draggable.current = Draggable.create(drag.current, {
        type: "x,y",
        minimumMovement: 4,
        dragClickables: false,
        allowContextMenu: true,
        zIndexBoost: false,
        onPress() {
          vel.current = { x: 0, y: 0, lx: this.x, ly: this.y, t: performance.now() };
        },
        onDrag() {
          const now = performance.now();
          const dt = Math.max(now - vel.current.t, 1) / 1000;
          vel.current = { x: (this.x - vel.current.lx) / dt, y: (this.y - vel.current.ly) / dt, lx: this.x, ly: this.y, t: now };
          update(this.x, this.y);
        },
        onDragEnd() {
          const v = decide(this.x, this.y, vel.current.x, vel.current.y);
          if (v !== undefined) return fling(v);
          const el = drag.current!;
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.55)",
            onUpdate: () => update(Number(gsap.getProperty(el, "x")), Number(gsap.getProperty(el, "y"))),
          });
        },
      })[0];
      return () => {
        draggable.current?.kill();
        gsap.killTweensOf([drag.current, tilt.current, inner.current]);
      };
    },
    { scope: wrap },
  );

  function impact(v: Answer) {
    sfx.stamp();
    navigator.vibrate?.(Math.abs(v) === 2 ? 22 : 10);
    onImpact(v);
  }

  // Torna la carta al centre, sense vot (si cancel·les el finançament).
  function reset() {
    busy.current = false;
    preview.current = undefined;
    setLabel(undefined);
    onPreview(undefined);
    gsap.to([q(".stamp-yes"), q(".stamp-no"), q(".stamp-meh")], { opacity: 0, duration: 0.2 });
    gsap.to(drag.current, { x: 0, y: 0, rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.55)" });
    draggable.current?.enable();
  }

  function fling(o: Outcome) {
    if (busy.current) return;
    busy.current = true;
    const need = typeof o === "number" && o > 0 ? needFor(o) : 0;
    draggable.current?.disable();
    gsap.to(inner.current, { rotationY: 0, duration: 0.25 });
    setFlipped(false);
    if (o !== "go") {
      preview.current = o ?? undefined;
      setLabel(o ?? undefined);
      onPreview(o ?? undefined);
    }
    if (reduced) {
      if (need > 0)
        return void onFund(need).then((r) => {
          if (r === "cancel") return reset();
          if (r === "no") return (busy.current = false), fling(null);
          onImpact(o as Answer);
          onDone(o, r);
        });
      onImpact(o === "go" ? null : o);
      return onDone(o);
    }
    const el = drag.current!;
    const x0 = Number(gsap.getProperty(el, "x"));
    const tl = gsap.timeline({ onComplete: () => onDone(o, from.current) });

    if (o === null) {
      sfx.flip();
      tl.to(el, { y: "+=50", rotationX: -30, scale: 0.88, opacity: 0, duration: 0.38, ease: "power2.in", onStart: () => onImpact(null) });
      return;
    }
    if (o === 0) {
      tl.to(el, { y: "+=14", duration: 0.12, ease: "power2.out" })
        .fromTo(q(".stamp-meh"), { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power4.in", onComplete: () => impact(0) })
        .to(el, { y: -innerHeight, scale: 0.8, rotation: gsap.utils.random(-10, 10), duration: 0.55, ease: "power2.in", onStart: sfx.whoosh }, "+=0.12");
      return;
    }
    const d = o === "go" ? Math.sign(x0) || 1 : Math.sign(o);
    if (o !== "go") {
      const stamp = q(d > 0 ? ".stamp-yes" : ".stamp-no");
      tl.to(el, { x: d * Math.max(Math.abs(x0), 46), rotation: d * 7, duration: 0.14, ease: "power2.out" })
        .fromTo(
          stamp,
          { opacity: 0, scale: Math.abs(o) === 2 ? 3 : 2.3, rotation: d * -32 },
          { opacity: 1, scale: 1, rotation: d * -12, duration: 0.2, ease: "power4.in", onComplete: () => impact(o) },
        )
        .to(q(".card-face"), { scale: 0.96, duration: 0.07, yoyo: true, repeat: 1 }, ">-0.02");
    }
    // Simulador de mandat: abans de llançar la carta cal dir d'on surten els diners.
    if (need > 0)
      tl.add(() => {
        tl.pause();
        void onFund(need).then((r) => {
          if (r === "cancel") return tl.kill(), reset();
          if (r === "no") {
            tl.kill();
            gsap.to(q(".stamp-yes"), { opacity: 0, duration: 0.15 });
            busy.current = false;
            return fling(null); // sense votar: «indiferent» comptaria una posició que no has triat
          }
          from.current = r;
          tl.resume();
        });
      });
    tl.to(el, { x: d * (innerWidth + 320), y: "+=90", rotation: d * 40, duration: 0.5, ease: "power2.in", onStart: sfx.whoosh }, "+=0.12");
  }

  useImperativeHandle(ref, () => ({ fling, busy: () => busy.current, flipped: () => flipped }));

  function flip(to: boolean) {
    setFlipped(to);
    sfx.flip();
    if (to) {
      onRead();
      draggable.current?.disable();
    } else draggable.current?.enable();
    gsap.to(inner.current, { rotationY: to ? 180 : 0, duration: reduced ? 0 : 0.75, ease: "power3.inOut" });
  }

  function onTilt(e: React.PointerEvent) {
    if (reduced || e.pointerType !== "mouse" || busy.current) return;
    const r = tilt.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(tilt.current, { rotationY: px * 10, rotationX: -py * 10, duration: 0.6, ease: "power3.out" });
  }
  function onTiltEnd() {
    gsap.to(tilt.current, { rotationY: 0, rotationX: 0, duration: 0.8, ease: "elastic.out(1, 0.6)" });
  }

  const stamp = "pointer-events-none absolute z-10 rounded-lg border-[3px] px-3 py-1 font-sans text-lg font-extrabold uppercase tracking-wider";
  const face =
    "absolute inset-0 flex flex-col overflow-hidden rounded-[28px] p-6 text-card-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] [backface-visibility:hidden] sm:p-8";

  return (
    <div ref={wrap} className="absolute inset-0">
      <span
        aria-hidden
        className="cue-no pointer-events-none absolute right-full top-1/2 mr-10 hidden -translate-y-1/2 font-serif text-[9rem] italic leading-none text-chalk opacity-0 lg:block"
      >
        No
      </span>
      <span
        aria-hidden
        className="cue-yes pointer-events-none absolute left-full top-1/2 ml-10 hidden -translate-y-1/2 font-serif text-[9rem] italic leading-none text-chalk opacity-0 lg:block"
      >
        Sí
      </span>
      <div ref={drag} className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing">
        <div
          ref={tilt}
          onPointerMove={onTilt}
          onPointerLeave={onTiltEnd}
          className="absolute inset-0 [perspective:1400px] [transform-style:preserve-3d]"
        >
          <div ref={inner} className="card-face relative size-full [transform-style:preserve-3d]">
            <article inert={flipped} className={`${face} bg-card ${red ? "outline outline-[6px] -outline-offset-[10px] outline-card-ink" : ""}`}>
              {red && (
                <span className="kicker absolute right-5 top-14 z-10 rotate-6 rounded-md border-2 border-card-ink bg-card px-2 py-1 text-card-ink">
                  ⊘ {t.game.red.mark}
                </span>
              )}
              <span
                aria-hidden
                className="gloss pointer-events-none absolute inset-0 opacity-25 mix-blend-soft-light [background-image:linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.9)_48%,transparent_62%)] [background-size:250%_250%]"
              />
              <span
                aria-hidden
                className="card-num num pointer-events-none absolute -bottom-12 -right-4 select-none font-serif text-[12.5rem] italic leading-none text-transparent [-webkit-text-stroke:1.5px_#c9c6bd]"
              >
                {pad2(item.n)}
              </span>
              <div className="relative flex items-start justify-between gap-3">
                <p className="kicker text-card-ink-2">
                  {format(t.game.card, { n: pad2(item.n) })} <span className="opacity-50">/ {pad2(total)}</span> · {topic}
                </p>
                {item.q.budget ? <CostTag budget={item.q.budget} /> : null}
              </div>
              <div className="relative flex flex-1 items-center">
                <h2
                  ref={heading}
                  tabIndex={-1}
                  className="font-serif text-[clamp(1.6rem,1.05rem+2.4vw,2.3rem)] leading-[1.1] tracking-[-0.018em] outline-none"
                >
                  {item.q.text}
                </h2>
              </div>
              <div className="relative flex items-end justify-between gap-3">
                <button
                  type="button"
                  aria-expanded={flipped}
                  onClick={() => flip(true)}
                  className="-ml-1 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold underline decoration-card-3 underline-offset-4 hover:decoration-card-ink"
                >
                  <span aria-hidden>↻</span> {t.game.why}
                </button>
                {prev !== undefined && (
                  <span className="text-right text-xs text-card-ink-2">
                    {format(t.game.previously, { v: prev === null ? t.game.skip : t.game.ballot[String(Math.sign(prev)) as "0"] })}
                  </span>
                )}
              </div>
              <span aria-hidden className={`stamp-yes ${stamp} left-5 top-16 border-card-ink ${red ? "bg-card-ink text-card" : ""}`}>
                {t.game.ballot["1"]}
              </span>
              <span aria-hidden className={`stamp-no ${stamp} right-5 top-16 border-card-ink ${red ? "bg-card-ink text-card" : ""}`}>
                {t.game.ballot["-1"]}
              </span>
              <span aria-hidden className={`stamp-meh ${stamp} bottom-20 left-1/2 border-dashed border-card-ink`}>
                {t.game.ballot["0"]}
              </span>
            </article>

            <article inert={!flipped} aria-hidden={!flipped} className={`${face} overflow-y-auto bg-card-2 [transform:rotateY(180deg)]`}>
              <p className="kicker text-card-ink-2">
                {t.game.context} · {topic}
              </p>
              <p className="mt-5 font-serif text-[1.3rem] leading-snug">{item.q.context}</p>
              <button
                type="button"
                onClick={() => flip(false)}
                className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-4 text-sm font-semibold underline decoration-card-3 underline-offset-4"
              >
                <span aria-hidden>↺</span> {t.game.backToCard}
              </button>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function Glyph({ v }: { v: Answer }) {
  if (v === 0)
    return (
      <svg viewBox="0 0 24 24" className="size-3" aria-hidden>
        <circle cx="12" cy="12" r="6" fill="currentColor" />
      </svg>
    );
  const d = Math.abs(v) === 2 ? "M5 6l6 6-6 6M12 6l6 6-6 6" : "M9 6l6 6-6 6";
  return (
    <svg viewBox="0 0 24 24" className={`size-6 ${v < 0 ? "-scale-x-100" : ""}`} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
