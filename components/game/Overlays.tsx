"use client";

import { useImperativeHandle, useRef, useState } from "react";
import type { Achievement } from "@/lib/achievements";
import { gsap, reducedMotion, sfx, SplitText, useGSAP } from "@/lib/fx";
import type { Answer } from "@/lib/schema";
import { format } from "@/lib/text";
import { useI18n } from "../I18n";

// Cop de mall: obre i tanca la sessió.
export function Gavel({ label, onImpact, onDone }: { label: string; onImpact?: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reducedMotion()) {
        gsap.delayedCall(0.5, onDone);
        return;
      }
      const split = SplitText.create(".gavel-text", { type: "chars" });
      gsap
        .timeline({ onComplete: onDone })
        .from(root.current, { opacity: 0, duration: 0.2 })
        .fromTo(".gavel-head", { rotation: -62 }, { rotation: 6, duration: 0.42, ease: "power4.in" })
        .add(() => {
          sfx.gavel();
          navigator.vibrate?.(30);
          onImpact?.();
        })
        .to(".gavel-head", { rotation: -4, duration: 0.25, ease: "power2.out" })
        .fromTo(".gavel-ring", { scale: 0.2, opacity: 0.9 }, { scale: 3.4, opacity: 0, duration: 0.8, ease: "expo.out" }, "<")
        .from(split.chars, { yPercent: 120, opacity: 0, rotation: 8, stagger: 0.025, duration: 0.5, ease: "back.out(2)" }, "<")
        .to(root.current, { opacity: 0, duration: 0.35, delay: 0.45 });
    },
    { scope: root },
  );
  return (
    <div ref={root} role="status" className="fixed inset-0 z-50 grid place-items-center bg-stage/70 backdrop-blur-sm">
      <div className="grid justify-items-center gap-6">
        <div aria-hidden className="relative grid h-40 w-56 place-items-end justify-center">
          <span className="gavel-ring absolute bottom-3 left-1/2 size-24 -translate-x-1/2 rounded-full border-2 border-chalk" />
          <svg viewBox="0 0 200 140" className="gavel-head absolute inset-0 h-full w-full origin-[160px_120px] overflow-visible">
            <rect x="58" y="22" width="72" height="34" rx="9" fill="#f2f1ec" />
            <rect x="52" y="26" width="10" height="26" rx="3" fill="#b4b2aa" />
            <rect x="126" y="26" width="10" height="26" rx="3" fill="#b4b2aa" />
            <rect x="88" y="52" width="12" height="76" rx="6" fill="#b4b2aa" transform="rotate(-38 94 56)" />
          </svg>
          <span className="block h-4 w-36 rounded-md bg-chalk-3" />
        </div>
        <p className="gavel-text display text-[clamp(2.6rem,1.8rem+3vw,4.6rem)] text-chalk">{label}</p>
      </div>
    </div>
  );
}

// Rètol d'inici de ronda.
export function RoundSplash({ round, total }: { round: number; total: number }) {
  const { m } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  useGSAP(
    () => {
      if (reducedMotion()) {
        gsap.delayedCall(0.4, () => setGone(true));
        return;
      }
      const split = SplitText.create(".splash-title", { type: "chars", mask: "chars" });
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .from(split.chars, { yPercent: 110, stagger: 0.04, duration: 0.55, ease: "expo.out" })
        .from(".splash-sub", { opacity: 0, y: 12, duration: 0.3 }, "-=0.3")
        .fromTo(".splash-line", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out" }, "<")
        .to(root.current, { opacity: 0, scale: 1.06, duration: 0.35, ease: "power2.in", delay: 0.35 });
    },
    { scope: root },
  );
  if (gone) return null;
  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-30 grid place-items-center bg-stage/75 backdrop-blur-md">
      <div className="grid justify-items-center gap-3 text-center">
        <p className="splash-title display text-[clamp(4rem,2.5rem+8vw,9rem)] italic text-chalk">{format(m.game.round, { n: round })}</p>
        <span className="splash-line block h-px w-40 origin-center bg-chalk" />
        <p className="splash-sub kicker text-chalk-2">{format(m.game.roundOf, { total })}</p>
      </div>
    </div>
  );
}

function Medal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M10 2h5l3 8h-5zM22 2h-5l-3 8h5z" fill="currentColor" opacity=".5" />
      <circle cx="16" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m16 15 1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="currentColor" />
    </svg>
  );
}

function Toast({ id, onDone }: { id: Achievement; onDone: () => void }) {
  const { m } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      sfx.chime();
      if (reducedMotion()) return void gsap.delayedCall(2.8, onDone);
      gsap
        .timeline({ onComplete: onDone })
        .from(root.current, { y: -40, opacity: 0, scale: 0.9, duration: 0.5, ease: "back.out(2)" })
        .from(".toast-medal", { rotation: -180, scale: 0, duration: 0.6, ease: "back.out(2.5)" }, "<0.1")
        .to(root.current, { y: -24, opacity: 0, duration: 0.35, ease: "power2.in", delay: 2.4 });
    },
    { scope: root },
  );
  const a = m.game.ach[id];
  return (
    <div ref={root} className="flex items-center gap-3 rounded-2xl border border-chalk-3/50 bg-stage-2/95 px-4 py-3 text-chalk shadow-2xl backdrop-blur">
      <Medal className="toast-medal size-8 shrink-0 text-chalk" />
      <div>
        <p className="kicker text-[0.6875rem] text-chalk-2">{m.game.achTitle}</p>
        <p className="font-serif text-lg leading-tight">{a.t}</p>
        <p className="text-xs text-chalk-2">{a.d}</p>
      </div>
    </div>
  );
}

export function Toasts({ items, onDone }: { items: Achievement[]; onDone: (id: Achievement) => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[max(84px,env(safe-area-inset-top))] z-40 grid justify-items-center gap-2 px-4">
      {items.map((id) => (
        <Toast key={id} id={id} onDone={() => onDone(id)} />
      ))}
    </div>
  );
}

// Final de ronda: estadístiques, una dada electoral i els assoliments.
export function RoundComplete({
  ref,
  round,
  fact,
  stats,
  ach,
  onDone,
}: {
  ref: React.Ref<{ fling: () => void }>;
  round: number;
  fact: string;
  stats: (Answer | null | undefined)[];
  ach: Achievement[];
  onDone: () => void;
}) {
  const { m } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const busy = useRef(false);
  const counts = {
    yes: stats.filter((a) => typeof a === "number" && a > 0).length,
    no: stats.filter((a) => typeof a === "number" && a < 0).length,
    neutral: stats.filter((a) => a === 0).length,
    skipped: stats.filter((a) => a === null).length,
  };

  useGSAP(
    () => {
      heading.current?.focus({ preventScroll: true });
      if (reducedMotion()) return;
      const split = SplitText.create(heading.current, { type: "words,chars", mask: "chars" });
      const tl = gsap.timeline();
      tl.from(root.current, { opacity: 0, scale: 0.94, duration: 0.45, ease: "power3.out" })
        .from(split.chars, { yPercent: 110, stagger: 0.018, duration: 0.6, ease: "expo.out" }, "<0.1")
        .from(".rc-stat", { y: 24, opacity: 0, stagger: 0.07, duration: 0.5, ease: "back.out(1.8)" }, "-=0.3");
      root.current?.querySelectorAll<HTMLElement>(".rc-num").forEach((el) => {
        const end = Number(el.dataset.v);
        const o = { v: 0 };
        tl.to(o, { v: end, duration: 0.8, ease: "power2.out", onUpdate: () => (el.textContent = String(Math.round(o.v))) }, "<");
      });
      tl.from(".rc-fact", { y: 16, opacity: 0, duration: 0.5 }, "-=0.2").from(".rc-ach", { scale: 0, rotation: -90, stagger: 0.06, duration: 0.5, ease: "back.out(2.5)" }, "-=0.2");
    },
    { scope: root },
  );

  function fling() {
    if (busy.current) return;
    busy.current = true;
    if (reducedMotion()) return onDone();
    sfx.whoosh();
    gsap.to(root.current, { y: -60, opacity: 0, scale: 0.96, duration: 0.4, ease: "power2.in", onComplete: onDone });
  }
  useImperativeHandle(ref, () => ({ fling }));

  return (
    <div ref={root} className="absolute inset-0 flex flex-col overflow-y-auto rounded-[28px] border border-chalk-3/50 bg-stage-2/95 p-6 text-chalk shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8">
      <p className="kicker text-chalk-2">{m.game.pause.kicker}</p>
      <h2 ref={heading} tabIndex={-1} className="display mt-3 text-[clamp(2.1rem,1.6rem+2vw,3rem)] outline-none">
        {format(m.game.roundDone, { n: round })}
      </h2>
      <dl className="mt-5 grid grid-cols-4 gap-2">
        {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
          <div key={k} className="rc-stat grid gap-1 rounded-xl bg-stage-3/60 p-2.5">
            <dt className="text-[0.6875rem] uppercase tracking-wider text-chalk-2">{m.game.pause.labels[k]}</dt>
            <dd className="rc-num num font-serif text-3xl leading-none" data-v={counts[k]}>
              {counts[k]}
            </dd>
          </div>
        ))}
      </dl>
      <div className="rc-fact mt-5 border-t border-chalk-3/40 pt-4">
        <p className="kicker text-chalk-2">{m.game.pause.title}</p>
        <p className="mt-2 font-serif text-[1.2rem] leading-snug">{fact}</p>
      </div>
      {ach.length > 0 && (
        <div className="mt-auto pt-4">
          <p className="kicker text-[0.6875rem] text-chalk-2">{m.game.achSoFar}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ach.map((a) => (
              <li key={a} className="rc-ach flex items-center gap-1.5 rounded-full border border-chalk-3/50 px-2.5 py-1 text-xs">
                <Medal className="size-4" /> {m.game.ach[a].t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
