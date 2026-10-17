"use client";

import { useRef, useState } from "react";
import { gsap, reducedMotion, sfx, useGSAP } from "@/lib/fx";
import type { GFunding } from "@/lib/game";
import { format } from "@/lib/text";
import { useI18n } from "../I18n";

export type FundResult = Record<string, number> | "no" | "cancel";
export type FundSource = GFunding & { remaining: number };

export function Coin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <circle cx="8" cy="8" r="4.2" fill="none" stroke="var(--color-stage, #0c0c0b)" strokeOpacity=".35" strokeWidth="1.2" />
    </svg>
  );
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

// Comptador del pressupost al marcador del joc.
export function BudgetChip({ value, label }: { value: number; label: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useGSAP(
    () => {
      const from = prev.current;
      prev.current = value;
      if (from === value || reducedMotion()) return;
      const o = { v: from };
      gsap.to(o, { v: value, duration: 0.7, ease: "power2.out", onUpdate: () => num.current && (num.current.textContent = signed(Math.round(o.v))) });
      gsap.fromTo(root.current, { scale: 1.3 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
    },
    { dependencies: [value] },
  );
  return (
    <span ref={root} title={label} className="kicker inline-flex items-center gap-1.5 rounded-full border border-chalk-3/60 bg-stage-2/80 px-2.5 py-1 text-chalk backdrop-blur">
      <Coin className="size-3.5 text-chalk" />
      <span className="sr-only">{label}:</span>
      <span ref={num} className="num">
        {signed(value)}
      </span>
    </span>
  );
}

// «D'on surten els diners?»: cal cobrir el cost abans de poder aprovar la proposta.
export function FundingSheet({ need, sources, onResolve }: { need: number; sources: FundSource[]; onResolve: (r: FundResult) => void }) {
  const { m } = useI18n();
  const f = m.game.fund;
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const closing = useRef(false);
  const got = Object.values(picks).reduce((a, b) => a + b, 0);
  const left = need - got;
  const remaining = (s: FundSource) => s.remaining - (picks[s.id] ?? 0);
  const available = sources.reduce((a, s) => a + Math.max(0, remaining(s)), 0);

  useGSAP(
    () => {
      root.current?.querySelector<HTMLButtonElement>(".fund-chip:not(:disabled)")?.focus({ preventScroll: true });
      if (reducedMotion()) return;
      gsap.from(".fund-backdrop", { opacity: 0, duration: 0.3 });
      gsap.from(".fund-sheet", { yPercent: 100, duration: 0.6, ease: "power4.out" });
      gsap.from(".fund-chip", { y: 24, opacity: 0, stagger: 0.025, duration: 0.45, delay: 0.2, ease: "back.out(1.8)" });
    },
    { scope: root },
  );

  function close(r: FundResult) {
    if (closing.current) return;
    closing.current = true;
    if (reducedMotion()) return onResolve(r);
    gsap.to(root.current!.querySelector(".fund-sheet"), { yPercent: 100, duration: 0.4, ease: "power3.in" });
    gsap.to(root.current!.querySelector(".fund-backdrop"), { opacity: 0, duration: 0.4, onComplete: () => onResolve(r) });
  }

  function fly(from: HTMLElement, n: number) {
    if (reducedMotion() || !bar.current) return;
    const host = root.current!.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = bar.current.getBoundingClientRect();
    for (let i = 0; i < Math.min(n, 8); i++) {
      const coin = document.createElement("span");
      coin.className = "pointer-events-none absolute z-50 size-4 rounded-full bg-chalk shadow-[0_0_14px_rgba(242,241,236,0.7)]";
      coin.style.left = `${a.left - host.left + a.width / 2 - 8}px`;
      coin.style.top = `${a.top - host.top + a.height / 2 - 8}px`;
      root.current!.appendChild(coin);
      const dx = b.left + b.width * Math.min(1, (got + n / 2) / need) - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      gsap
        .timeline({ delay: i * 0.05, onComplete: () => coin.remove() })
        .to(coin, { x: dx, duration: 0.55, ease: "power1.inOut" }, 0)
        .to(coin, { y: dy - 60, duration: 0.27, ease: "power2.out" }, 0)
        .to(coin, { y: dy, duration: 0.28, ease: "power2.in" }, 0.27)
        .to(coin, { scale: 0.3, opacity: 0, duration: 0.15 }, 0.5);
    }
  }

  function take(s: FundSource, el: HTMLElement) {
    const n = Math.min(left, remaining(s));
    if (n <= 0 || closing.current) return;
    sfx.tick();
    fly(el, n);
    const next = { ...picks, [s.id]: (picks[s.id] ?? 0) + n };
    setPicks(next);
    if (left - n === 0) {
      sfx.chime();
      gsap.delayedCall(reducedMotion() ? 0 : 0.75, () => close(next));
    }
  }

  const groups: GFunding["kind"][] = ["cut", "tax", "debt"];
  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fund-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") close("cancel");
        e.stopPropagation();
      }}
      className="fixed inset-0 z-40 flex items-end justify-center"
    >
      <div className="fund-backdrop absolute inset-0 bg-stage/70 backdrop-blur-sm" onClick={() => close("cancel")} />
      <div className="fund-sheet relative max-h-[88dvh] w-full max-w-2xl overflow-y-auto [scrollbar-color:#2a2926_transparent] [scrollbar-width:thin] rounded-t-[2rem] border border-b-0 border-chalk-3/50 bg-stage-2 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6 text-chalk shadow-2xl sm:px-8">
        <p className="kicker text-chalk-2">{f.kicker}</p>
        <h2 id="fund-title" className="display mt-2 text-[clamp(2rem,1.5rem+2vw,2.8rem)]">
          {f.title}
        </h2>
        <p className="mt-2 text-chalk-2">
          {format(f.cost, { n: need })} {left > 0 ? format(f.need, { n: left }) : f.covered}
        </p>
        <div ref={bar} aria-hidden className="mt-4 h-3 overflow-hidden rounded-full bg-stage-3">
          <div className="h-full rounded-full bg-chalk transition-[width] duration-500 ease-out-quint" style={{ width: `${(got / need) * 100}%` }} />
        </div>
        <p aria-live="polite" className="sr-only">
          {left > 0 ? format(f.need, { n: left }) : f.covered}
        </p>

        {groups.map((g) => {
          const list = sources.filter((s) => s.kind === g);
          if (!list.length) return null;
          return (
            <section key={g} className="mt-6">
              <h3 className="kicker text-chalk-2">{f[g]}</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {list.map((s) => {
                  const rem = remaining(s);
                  const picked = picks[s.id] ?? 0;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={rem <= 0 || left <= 0}
                      aria-label={format(f.take, { n: Math.min(left, Math.max(rem, 0)), name: s.name })}
                      onClick={(e) => take(s, e.currentTarget)}
                      className={`fund-chip group grid gap-1 rounded-2xl border p-3.5 text-left transition-colors duration-200 active:scale-[0.97] disabled:opacity-35 ${
                        picked ? "border-chalk bg-chalk text-stage" : "border-chalk-3/50 bg-stage hover:border-chalk-2"
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold leading-tight">{s.name}</span>
                        <span className="num inline-flex shrink-0 items-center gap-1 text-xs">
                          <Coin className="size-3" /> {picked ? `−${picked}` : format(f.left, { n: rem })}
                        </span>
                      </span>
                      <span className={`text-xs ${picked ? "text-stage/70" : "text-chalk-2"}`}>{s.detail}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {available < left && <p className="mt-5 text-sm text-chalk-2">{f.empty}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => close("no")} className="btn border-chalk-3 text-chalk">
            {f.no}
          </button>
          <button type="button" onClick={() => close("cancel")} className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-chalk-2 hover:text-chalk">
            ↶ {f.cancel}
          </button>
          {got > 0 && left > 0 && (
            <button type="button" onClick={() => setPicks({})} className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-chalk-2 hover:text-chalk">
              {f.reset}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CostTag({ budget }: { budget: number }) {
  const { m } = useI18n();
  return (
    <span className="num inline-flex items-center gap-1 rounded-full border border-card-ink/25 px-2 py-0.5 text-[0.7rem] font-semibold text-card-ink">
      <Coin className="size-3" />
      {budget < 0 ? format(m.game.costs, { n: -budget }) : format(m.game.yields, { n: budget })}
    </span>
  );
}
