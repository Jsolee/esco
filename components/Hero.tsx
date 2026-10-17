"use client";

import { useRef } from "react";
import { gsap, reducedMotion, ScrollTrigger, SplitText, useGSAP } from "@/lib/fx";
import { FILL, SEATS } from "@/lib/hemicycle";
import { Start, type ElectionSummary } from "./Start";
import { Stage3D } from "./three/Stage3D";
import type { ProvinceOption } from "@/lib/territory";

const YOU = FILL.find((i) => SEATS[i].row === 6)!;
const IDLE = SEATS.map((s) => 0.2 + s.row * 0.022);

// Portada: el ple de nit, en 3D, amb el títol que entra lletra a lletra.
export function Hero({
  kicker,
  title,
  lead,
  note,
  yourSeat,
  provinces,
  communities,
  elections,
}: {
  kicker: string;
  title: string;
  lead: string;
  note: string;
  yourSeat: string;
  provinces: ProvinceOption[];
  communities: Record<string, string>;
  elections: ElectionSummary[];
}) {
  const root = useRef<HTMLElement>(null);
  const [titleA, titleB] = title.split(/(?<=\.)\s/);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(".hero-title", { type: "words,chars", mask: "chars" });
      gsap
        // La màscara retalla els accents de les majúscules («Ú»): es desfà en acabar.
        .timeline({ delay: 0.15, onComplete: () => split.revert() })
        .from(split.chars, { yPercent: 118, rotation: 6, stagger: 0.028, duration: 1.1, ease: "expo.out" })
        .from(".hero-fade", { y: 28, opacity: 0, stagger: 0.09, duration: 0.8, ease: "power3.out" }, "-=0.7");
      // En baixar, el títol s'allunya i el ple s'enfosqueix; el formulari d'inici no, perquè no sembli desactivat.
      gsap.to(".hero-recede", {
        yPercent: -12,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "60% center", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate mx-3 flex min-h-[88svh] flex-col overflow-hidden rounded-[2rem] bg-stage text-chalk sm:mx-5">
      <Stage3D mode="idle" lit={IDLE} you={YOU} youLabel={yourSeat} fallbackClass="mt-[6svh] h-auto w-[min(94vw,760px)] self-start" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_75%_at_50%_10%,transparent_40%,rgba(12,12,11,0.9)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-stage via-stage/85 to-transparent" />
      <div className="hero-copy relative z-10 mt-auto max-w-3xl px-6 pb-8 pt-[38svh] sm:px-10 sm:pb-12 lg:px-14">
        <div className="hero-recede">
          <p className="hero-fade kicker text-chalk-2">{kicker}</p>
          <h1 className="hero-title display mt-5 text-[clamp(3.4rem,1.9rem+6.4vw,7.6rem)]">
            {titleA} <em className="italic">{titleB}</em>
          </h1>
          <p className="hero-fade mt-6 max-w-[36ch] text-xl leading-snug text-chalk-2">{lead}</p>
        </div>
        <div className="hero-fade">
          <Start provinces={provinces} communities={communities} elections={elections} />
        </div>
        <p className="hero-fade mt-6 max-w-[48ch] text-sm text-chalk-3">{note}</p>
      </div>
    </section>
  );
}

// Cinta de temes que corre sense parar: un avançament del que es vota.
export function Ticker({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      const track = root.current!.querySelector(".ticker-track")!;
      const tween = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        trigger: root.current,
        onUpdate: (self) => {
          tween.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 300, 6));
          gsap.to(tween, { timeScale: 1, duration: 1.2, overwrite: true });
        },
      });
    },
    { scope: root },
  );
  const row = [...items, ...items];
  return (
    <div ref={root} aria-hidden className="mt-16 overflow-hidden border-y border-rule py-5">
      <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-serif text-[clamp(2.4rem,1.6rem+3vw,4.5rem)] italic leading-none">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-transparent [-webkit-text-stroke:1px_var(--ink-3)]">
            {t}
            <span className="size-3 rounded-full bg-ink-3" />
          </span>
        ))}
      </div>
    </div>
  );
}

// Entrada en fer scroll per a qualsevol bloc.
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(root.current!.querySelectorAll(":scope > * > *"), {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 82%" },
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
