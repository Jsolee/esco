"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { gsap, reducedMotion, sfx, SplitText, useGSAP } from "@/lib/fx";
import type { GameData, GCandidacy, GQuestion } from "@/lib/game";
import { dhondt, match, type Answers } from "@/lib/match";
import type { Answer } from "@/lib/schema";
import { encodeShare } from "@/lib/share";
import { format } from "@/lib/text";
import { useI18n } from "../I18n";
import { LocaleSwitch } from "../LocaleSwitch";
import type { ChamberHandle } from "../three/Chamber";
import { Stage3D } from "../three/Stage3D";
import { ThemeToggle } from "../ThemeToggle";
import { Wordmark } from "../Wordmark";
import { PoliticalMap } from "./PoliticalMap";
import { ScaleGlyph } from "./ScaleGlyph";

export function Results({
  data,
  order,
  answers,
  priorities,
  candidacies,
  onRestart,
  onFirst,
}: {
  data: GameData;
  order: GQuestion[];
  answers: Answers;
  priorities: string[];
  candidacies: GCandidacy[];
  onRestart: () => void;
  onFirst: () => void;
}) {
  const { m, locale } = useI18n();
  const r = m.results;
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const chamberApi = useRef<ChamberHandle>(null);
  const [copied, setCopied] = useState(false);
  const byId = useMemo(() => Object.fromEntries(candidacies.map((c) => [c.id, c])), [candidacies]);
  const result = useMemo(
    () => match({ questions: order, answers, priorities, candidacies, order: candidacies.map((c) => c.id) }),
    [order, answers, priorities, candidacies],
  );
  const voted = order.filter((q) => typeof answers[q.id] === "number").length;
  const top = result.ranked.filter((x) => x.rank === 1);
  const tied = (rank: number) => result.ranked.filter((x) => x.rank === rank).length > 1;

  // 350 escons amb D'Hondt, prenent l'afinitat com a vots, d'esquerra a dreta per l'eix econòmic.
  const chamber = useMemo(() => {
    const seats = dhondt(result.ranked.map((x) => ({ id: x.id, votes: x.affinity })), 350);
    const layout = [...result.ranked].sort((a, b) => (byId[a.id].axes.economic ?? 0) - (byId[b.id].axes.economic ?? 0));
    const colors: (string | undefined)[] = layout.flatMap((x) => Array<string>(seats[x.id]).fill(byId[x.id].color));
    const lit = Array.from({ length: 350 }, (_, i) => (colors[i] ? 1 : 0.12));
    return { seats, layout, colors, lit };
  }, [result, byId]);

  useGSAP(
    () => {
      scrollTo({ top: 0 });
      heading.current?.focus({ preventScroll: true });
      if (reducedMotion()) return;
      const winner = top[0] && byId[top[0].id];
      const split = SplitText.create(".res-name", { type: "words,chars", mask: "chars" });
      const o = { v: 0 };
      gsap
        .timeline({ delay: 0.3 })
        .from(".res-kicker", { opacity: 0, y: 12, duration: 0.5 })
        .from(".res-goes", { opacity: 0, y: 16, duration: 0.5 }, "-=0.2")
        .add(() => sfx.reveal(), 1.5)
        .from(split.chars, { yPercent: 120, rotation: 8, stagger: 0.035, duration: 0.9, ease: "expo.out" }, 1.5)
        .add(() => winner && chamberApi.current?.burst(winner.color), 1.8)
        .from(".res-pct", { opacity: 0, scale: 0.8, duration: 0.6, ease: "back.out(2)" }, 1.9)
        .to(o, { v: top[0]?.affinity ?? 0, duration: 1.4, ease: "power3.out", onUpdate: () => pct.current && (pct.current.textContent = String(Math.round(o.v))) }, 1.9)
        .from(".res-legend > *", { opacity: 0, x: 24, stagger: 0.05, duration: 0.45 }, 2.3);

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
        gsap.from(el, { y: 50, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }),
      );
      gsap.utils.toArray<HTMLElement>(".rank-row").forEach((el) => {
        gsap.from(el, { y: 30, opacity: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" } });
        gsap.from(el.querySelector(".rank-bar"), { scaleX: 0, duration: 1.2, ease: "expo.out", delay: 0.15, scrollTrigger: { trigger: el, start: "top 92%" } });
      });
    },
    { scope: root },
  );

  async function share() {
    const url = `${location.origin}/${locale}/r/${encodeShare(data.electionId, result.ranked)}`;
    const text = format(r.shareText, { top: top.map((x) => byId[x.id].name).join(" · ") });
    try {
      if (navigator.share) return await navigator.share({ title: "Escó", text, url });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  return (
    <div ref={root} className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href={`/${locale}`} aria-label={m.nav.home} className="inline-flex min-h-11 items-center">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <LocaleSwitch />
          <ThemeToggle className="hover:bg-sunken" />
        </div>
      </header>

      <section aria-labelledby="res-h" className="relative isolate mx-3 flex min-h-[86svh] flex-col overflow-hidden rounded-[2rem] bg-stage text-chalk sm:mx-5">
        <Stage3D
          handle={chamberApi}
          mode="reveal"
          from="count"
          lit={chamber.lit}
          colors={chamber.colors}
          fallbackClass="mt-[6svh] h-auto w-[min(92vw,720px)] self-start"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-stage via-stage/85 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-stage/80 to-transparent" />
        {data.fictional && (
          <p className="relative z-10 m-4 self-start rounded-full border border-dashed border-chalk-3 px-3 py-1.5 text-xs text-chalk-2 sm:m-6">
            <strong className="kicker mr-2 text-chalk">{m.game.fictional}</strong>
            {m.game.fictionalBanner}
          </p>
        )}
        <div className="relative z-10 mt-auto grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="res-kicker kicker text-chalk-2">
              {r.kicker} · {data.name}
            </p>
            {top.length > 0 ? (
              <>
                <p className="res-goes mt-4 text-xl text-chalk-2">{top.length > 1 ? r.tie : r.goesTo}</p>
                <h1 id="res-h" ref={heading} tabIndex={-1} className="display mt-2 text-[clamp(3.2rem,1.6rem+7vw,8.4rem)] outline-none">
                  {top.map((x) => (
                    <span key={x.id} className="flex items-center gap-[0.18em]">
                      <span
                        aria-hidden
                        className="inline-block size-[0.36em] shrink-0 rounded-full shadow-[0_0_40px_currentColor]"
                        style={{ background: byId[x.id].color, color: byId[x.id].color }}
                      />
                      <span className="res-name">{byId[x.id].name}</span>
                    </span>
                  ))}
                </h1>
                <p className="res-pct mt-4 flex items-baseline gap-3">
                  <span className="display num text-[clamp(4rem,3rem+4vw,6.5rem)]">
                    <span ref={pct}>{top[0].affinity}</span>
                    <span className="text-[0.45em]">%</span>
                  </span>
                  <span className="text-lg text-chalk-2">{r.affinity}</span>
                </p>
                <p className="mt-1 text-sm text-chalk-3">{format(r.basedOn, { n: voted })}</p>
              </>
            ) : (
              <>
                <h1 id="res-h" ref={heading} tabIndex={-1} className="display mt-4 text-[clamp(2.8rem,1.8rem+4vw,5rem)] outline-none">
                  {r.allSkipped.title}
                </h1>
                <p className="mt-4 max-w-[46ch] text-lg text-chalk-2">{r.allSkipped.text}</p>
                <button type="button" onClick={onFirst} className="btn mt-6 bg-chalk text-stage">
                  {r.allSkipped.back}
                </button>
              </>
            )}
          </div>
          {result.ranked.length > 0 && (
            <div className="res-legend grid gap-3 rounded-2xl border border-chalk-3/40 bg-stage-2/70 p-5 backdrop-blur">
              <h2 className="font-serif text-2xl">{r.hemicycleTitle}</h2>
              <ul className="grid gap-1.5 text-sm">
                {chamber.layout.map((x) => (
                  <li key={x.id} className="flex items-center gap-2.5">
                    <span aria-hidden className="size-3 rounded-full" style={{ background: byId[x.id].color }} />
                    <span className="flex-1">{byId[x.id].name}</span>
                    <span className="num text-chalk-2">{format(r.seats, { n: chamber.seats[x.id] })}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-chalk-3">{r.hemicycleText}</p>
            </div>
          )}
        </div>
      </section>

      <main id="main" className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        {result.ranked.length > 0 && (
          <section className="mt-16" aria-labelledby="res-rk">
            <h2 id="res-rk" className="reveal kicker text-ink-2">
              {r.rankingTitle}
            </h2>
            <ol className="mt-3 border-t-2 border-ink">
              {result.ranked.map((x) => {
                const c = byId[x.id];
                return (
                  <li key={x.id} className="rank-row grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 border-b border-rule py-5 sm:grid-cols-[4rem_minmax(0,1fr)]">
                    <span className="num font-serif text-3xl font-light text-ink-2">
                      {tied(x.rank) ? "=" : ""}
                      {x.rank}
                    </span>
                    <div className="grid min-w-0 gap-2.5">
                      <div className="flex items-baseline justify-between gap-4">
                        <p>
                          <span className="text-lg font-semibold">{c.name}</span>
                          {c.members && <span className="block text-sm text-ink-3">{format(r.members, { list: c.members.join(", ") })}</span>}
                        </p>
                        <p className="num font-serif text-4xl font-light">
                          {x.affinity}
                          <span className="text-[0.5em]">%</span>
                        </p>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-sunken">
                        <div className="rank-bar h-full origin-left rounded-full" style={{ width: `${x.affinity}%`, background: c.color }} />
                      </div>
                      {x.coverage < 1 && <p className="text-sm text-ink-3">{format(r.coverage, { n: Math.round(x.coverage * 100) })}</p>}
                      <Comparison c={c} order={order} answers={answers} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {result.insufficient.length > 0 && voted > 0 && (
          <section className="reveal mt-10 grid gap-2" aria-labelledby="res-in">
            <h2 id="res-in" className="kicker text-ink-2">
              {r.insufficientTitle}
            </h2>
            <p className="text-sm text-ink-2">{r.insufficientText}</p>
            <ul className="border-t border-rule">
              {result.insufficient.map((x) => (
                <li key={x.id} className="grid gap-1 border-b border-rule py-3">
                  <p className="flex justify-between gap-4">
                    <span className="font-semibold">{byId[x.id].name}</span>
                    <span className="num text-sm text-ink-3">{Math.round(x.coverage * 100)} %</span>
                  </p>
                  <Comparison c={byId[x.id]} order={order} answers={answers} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {voted > 0 && (
          <section className="reveal mt-16 grid gap-8 lg:grid-cols-[1fr_1.2fr]" aria-labelledby="res-map">
            <div className="grid content-start gap-3">
              <h2 id="res-map" className="font-serif text-3xl">
                {r.mapTitle}
              </h2>
              <p className="max-w-[46ch] text-ink-2">{r.mapText}</p>
            </div>
            <PoliticalMap
              axes={data.axes}
              points={[
                ...[...result.ranked, ...result.insufficient].map((x) => ({
                  id: x.id,
                  label: byId[x.id].name.length > 14 ? byId[x.id].short : byId[x.id].name,
                  color: byId[x.id].color,
                  point: byId[x.id].axes,
                })),
                { id: "you", label: r.you, point: result.user, you: true },
              ]}
            />
          </section>
        )}

        <section className="reveal mt-16 grid gap-6 border-t-2 border-ink pt-8">
          <div className="flex flex-wrap items-center gap-3">
            {result.ranked.length > 0 && (
              <button type="button" onClick={share} className="btn bg-ink text-paper">
                {r.share}
              </button>
            )}
            <button type="button" onClick={onRestart} className="btn">
              {r.again}
            </button>
            <Link href={`/${locale}/metodologia`} className="inline-flex min-h-11 items-center px-2 font-medium underline decoration-ink-3 underline-offset-4">
              {r.how}
            </Link>
            <span aria-live="polite" className="text-sm text-ink-2">
              {copied ? r.copied : ""}
            </span>
          </div>
          <p className="max-w-[60ch] border-l-2 border-ink pl-4 text-sm text-ink-2">{r.disclaimer}</p>
        </section>
      </main>
    </div>
  );
}

function Comparison({ c, order, answers }: { c: GCandidacy; order: GQuestion[]; answers: Answers }) {
  const { m } = useI18n();
  const r = m.results;
  const label = (v: Answer) => m.game.votes[String(v) as "0"];
  return (
    <details className="group">
      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
        {r.compare} <span aria-hidden className="transition group-open:rotate-90">›</span>
      </summary>
      <div className="overflow-x-auto">
        <table className="mt-2 w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">{r.colStatement}</th>
              <th scope="col" className="py-2 pr-4 font-semibold">{r.colYou}</th>
              <th scope="col" className="py-2 pr-4 font-semibold">{c.short}</th>
              <th scope="col" className="py-2 font-semibold">{r.colSource}</th>
            </tr>
          </thead>
          <tbody>
            {order.map((q) => {
              const a = answers[q.id];
              const p = c.positions[q.id];
              const src = p && c.sources[p.source];
              return (
                <tr key={q.id} className="border-b border-rule align-top">
                  <td className="max-w-[24rem] py-3 pr-4">{q.text}</td>
                  <td className="py-3 pr-4">
                    {typeof a === "number" ? <ScaleGlyph value={a} label={label(a)} /> : <span className="text-ink-3">{a === null ? r.skipped : "—"}</span>}
                  </td>
                  <td className="py-3 pr-4">
                    {p && p.value !== null ? <ScaleGlyph value={p.value} label={label(p.value)} /> : <span className="text-ink-3">{r.noPosition}</span>}
                  </td>
                  <td className="py-3">
                    {src &&
                      (p.value !== null ? (
                        <a href={p.url ?? src.url} target="_blank" rel="noopener noreferrer" className="underline decoration-ink-3 underline-offset-4 hover:decoration-ink">
                          {src.title}
                          {p.page ? `, ${format(r.page, { n: p.page })}` : ""}
                        </a>
                      ) : (
                        <span className="text-ink-3">{src.title}</span>
                      ))}
                    {p?.quote && (
                      <q lang={src?.lang} className="mt-1 block text-ink-2 italic">
                        {p.quote}
                      </q>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
