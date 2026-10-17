"use client";

import { useId, useRef } from "react";
import { gsap, reducedMotion, sfx, SplitText, useGSAP, useSound } from "@/lib/fx";
import type { GameData, GQuestion } from "@/lib/game";
import { format } from "@/lib/text";
import { useI18n } from "../I18n";

export function SoundToggle({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { m } = useI18n();
  const [on, toggle] = useSound();
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={toggle}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-chalk-3/50 px-3 text-xs font-semibold uppercase tracking-wider text-chalk-2 hover:text-chalk aria-pressed:border-chalk aria-pressed:text-chalk ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? (
          <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        ) : (
          <path d="m16.5 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>
      <span className={compact ? "hidden sm:inline" : ""}>{m.game.sound}</span>
    </button>
  );
}

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
  const root = useRef<HTMLElement>(null);
  const i = m.game.intro;
  const arrow = { right: "→", left: "←", up: "↑" } as const;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(".intro-title", { type: "words,chars", mask: "chars" });
      gsap
        .timeline({ delay: 0.3 })
        .from(split.chars, { yPercent: 115, stagger: 0.022, duration: 0.9, ease: "expo.out" })
        .from(".intro-item", { y: 26, opacity: 0, stagger: 0.07, duration: 0.6, ease: "power3.out" }, "-=0.6")
        .from(".intro-demo", { y: 80, rotation: 10, opacity: 0, duration: 1, ease: "back.out(1.4)" }, "-=0.9");
      gsap.to(".nudge-right", { x: 5, repeat: -1, yoyo: true, duration: 0.6, ease: "sine.inOut" });
      gsap.to(".nudge-left", { x: -5, repeat: -1, yoyo: true, duration: 0.6, ease: "sine.inOut" });
      gsap.to(".nudge-up", { y: -5, repeat: -1, yoyo: true, duration: 0.6, ease: "sine.inOut" });
      gsap.to(".start-glow", { scale: 1.25, opacity: 0, repeat: -1, duration: 1.6, ease: "power2.out" });
    },
    { scope: root },
  );

  return (
    <main
      ref={root}
      className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end gap-12 px-5 pb-10 pt-[32dvh] sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:pt-[24dvh]"
    >
      <div className="max-w-xl">
        <p className="intro-item kicker text-chalk-2">
          {i.kicker} · {data.name}
        </p>
        <h1 className="intro-title display mt-4 text-[clamp(2.9rem,1.6rem+5.2vw,5.8rem)]">{i.title}</h1>
        <p className="intro-item mt-5 text-lg text-chalk-2">{format(i.text, { n: count })}</p>
        <ul className="mt-6 grid gap-2.5">
          {i.gestures.map((g) => (
            <li key={g.dir} className="intro-item flex items-center gap-3">
              <span aria-hidden className="grid size-9 place-items-center rounded-full border border-chalk-3/60 bg-stage/60 text-chalk backdrop-blur">
                <span className={`nudge-${g.dir}`}>{arrow[g.dir as keyof typeof arrow]}</span>
              </span>
              <span>{g.text}</span>
            </li>
          ))}
        </ul>

        <div className="intro-item mt-8 grid gap-2">
          <label htmlFor={`${id}-p`} className="text-sm text-chalk-2">
            {province ? i.circ : i.pick}
          </label>
          <select
            id={`${id}-p`}
            value={province ?? ""}
            onChange={(e) => e.target.value && onProvince(e.target.value)}
            className="min-h-12 w-full max-w-sm rounded-full border border-chalk-3/60 bg-stage-2/80 px-4 font-serif text-xl text-chalk backdrop-blur"
          >
            {!province && <option value="">{i.pick}</option>}
            {data.provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="intro-item mt-8 flex flex-wrap items-center gap-4">
          <span className="relative inline-grid">
            <span aria-hidden className="start-glow pointer-events-none absolute inset-0 rounded-full border-2 border-chalk" />
            <button type="button" onClick={onStart} disabled={!province} className="btn group relative bg-chalk px-8 text-lg text-stage">
              {i.start} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </span>
          <SoundToggle />
        </div>
        <p className="intro-item mt-4 hidden text-sm text-chalk-3 [@media(hover:hover)]:block">{i.keys}</p>
        {data.fictional && (
          <p className="intro-item mt-6 max-w-md border-l-2 border-dashed border-chalk-3 pl-3 text-sm text-chalk-2">
            <strong className="kicker mr-2 text-chalk">{m.game.fictional}</strong>
            {m.game.fictionalBanner}
          </p>
        )}
      </div>

      <div aria-hidden className="intro-demo relative mx-auto hidden h-[360px] w-[300px] shrink-0 sm:block lg:mx-0">
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
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      heading.current?.focus({ preventScroll: true });
      if (reducedMotion()) return;
      const split = SplitText.create(heading.current, { type: "words,chars", mask: "chars" });
      gsap
        .timeline()
        .from(split.chars, { yPercent: 115, stagger: 0.02, duration: 0.8, ease: "expo.out" })
        .from(".prio-tile", { y: 50, rotationX: -50, opacity: 0, stagger: { each: 0.06, from: "random" }, duration: 0.7, ease: "back.out(1.6)" }, "-=0.5")
        .from(".prio-go", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3");
    },
    { scope: root },
  );

  const toggle = contextSafe((e: React.MouseEvent<HTMLButtonElement>, topic: string) => {
    const on = !selected.includes(topic);
    onToggle(topic);
    if (on) sfx.chime();
    else sfx.tick();
    if (reducedMotion()) return;
    gsap.fromTo(e.currentTarget, { scale: on ? 0.9 : 1.04 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" });
    if (on) gsap.fromTo(e.currentTarget.querySelector(".prio-x2"), { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(3)" });
  });

  return (
    <main ref={root} className="relative mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
      <p className="kicker text-chalk-2">{p.kicker}</p>
      <h1 ref={heading} tabIndex={-1} className="display mt-3 text-[clamp(2.7rem,1.6rem+4.4vw,5rem)] outline-none">
        {p.title}
      </h1>
      <p className="mt-4 max-w-[46ch] text-lg text-chalk-2">{p.text}</p>
      <div role="group" aria-label={p.title} className="mt-8 grid grid-cols-2 gap-3 [perspective:900px] md:grid-cols-4">
        {topics.map((t) => {
          const on = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={(e) => toggle(e, t.id)}
              className={`prio-tile group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left backdrop-blur transition-colors duration-200 ${
                on
                  ? "border-chalk bg-chalk text-stage shadow-[0_0_60px_rgba(242,241,236,0.35)]"
                  : "border-chalk-3/50 bg-stage-2/80 text-chalk hover:border-chalk-2"
              }`}
            >
              <span className="font-serif text-[1.45rem] leading-tight">{t.name}</span>
              <span className="flex items-end justify-between gap-2">
                <span className={`text-xs ${on ? "text-stage/70" : "text-chalk-2"}`}>
                  {format(p.count, { n: questions.filter((q) => q.topic === t.id).length })}
                </span>
                <span aria-hidden className={`prio-x2 num font-serif text-4xl italic leading-none ${on ? "" : "opacity-0"}`}>
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
      <div className="prio-go mt-6 flex flex-wrap items-center gap-4 pb-[max(16px,env(safe-area-inset-bottom))]">
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
  const root = useRef<HTMLElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) {
        gsap.delayedCall(0.4, onDone);
        return;
      }
      const split = SplitText.create(".count-title", { type: "chars", mask: "chars" });
      const o = { v: 0 };
      gsap
        .timeline({ onComplete: onDone })
        .from(split.chars, { yPercent: 115, stagger: 0.04, duration: 0.8, ease: "expo.out" }, 0.4)
        .to(o, { v: votes, duration: 2.2, ease: "power2.inOut", onUpdate: () => num.current && (num.current.textContent = String(Math.round(o.v))) }, 0.6)
        .fromTo(".count-progress", { scaleX: 0 }, { scaleX: 1, duration: 2.8, ease: "power1.inOut" }, 0.4)
        .from(".count-fact", { opacity: 0, y: 12, duration: 0.6 }, 1)
        .to(root.current, { opacity: 0, duration: 0.4 }, "+=0.3");
    },
    { scope: root },
  );

  return (
    <main ref={root} aria-busy="true" className="relative flex flex-1 flex-col items-center justify-end gap-6 px-6 pb-[14dvh] text-center">
      <h1 className="count-title display text-[clamp(3.2rem,2rem+5vw,6.5rem)]">{m.game.counting.title}</h1>
      <p className="flex items-baseline gap-3 text-chalk-2">
        <span ref={num} className="num font-serif text-5xl text-chalk">
          0
        </span>
        {m.game.counting.text}
      </p>
      <div aria-hidden className="h-px w-56 overflow-hidden bg-chalk-3/40">
        <div className="count-progress h-full origin-left bg-chalk" />
      </div>
      {fact && <p className="count-fact max-w-md font-serif text-lg italic text-chalk-2">{fact}</p>}
    </main>
  );
}
