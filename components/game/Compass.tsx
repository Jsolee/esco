"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TOKENS } from "@/lib/budget";
import { sentenceOf } from "@/lib/compass";
import type { GameData } from "@/lib/game";
import { AXES, axesOf, type Answers } from "@/lib/match";
import { encodeSaved, LINK_PREFIX } from "@/lib/saved";
import type { Answer, Axis } from "@/lib/schema";
import { encodeCompass } from "@/lib/share";
import { format } from "@/lib/text";
import { useI18n } from "../I18n";
import { LocaleSwitch } from "../LocaleSwitch";
import { ThemeToggle } from "../ThemeToggle";
import { Wordmark } from "../Wordmark";
import { PoliticalMap } from "./PoliticalMap";

const VALUES: Answer[] = [-2, -1, 0, 1, 2];

// Pantalla final del mode brúixola: el vot queda «a l'urna» fins que hi hagi candidatures oficials.
// Amb `ready`, les candidatures ja hi són i la persona torna amb respostes desades: només cal obrir el vot.
export function Compass({
  data,
  answers,
  tokens,
  province,
  ready = false,
  restored = false,
  onAnswer,
  onToken,
  onOpen,
  onReplay,
  onClear,
}: {
  data: GameData;
  answers: Answers;
  tokens: Record<string, number>;
  province: string | null;
  ready?: boolean;
  restored?: boolean;
  onAnswer: (id: string, value: Answer | null) => void;
  onToken: (topic: string, delta: 1 | -1) => void;
  onOpen?: () => void;
  onReplay: () => void;
  onClear: () => void;
}) {
  const { m, locale } = useI18n();
  const c = m.compass;
  const [review, setReview] = useState(false);
  const [note, setNote] = useState("");
  const [now] = useState(() => Date.now());

  const voted = data.questions.filter((q) => typeof answers[q.id] === "number").length;
  const point = useMemo(() => axesOf(data.questions, answers), [data.questions, answers]);
  const axes = AXES.filter((a) => data.axes.includes(a));
  const used = Object.values(tokens).reduce((x, y) => x + y, 0);

  // Frase en llenguatge planer, un tros per eix.
  const sentence = sentenceOf(point, axes, c.levels);

  // Temes amb opinions més marcades: mitjana de |resposta| entre les votades.
  const strongest = useMemo(() => {
    const byTopic = data.topics
      .map((t) => {
        const vals = data.questions.filter((q) => q.topic === t.id).map((q) => answers[q.id]).filter((a): a is Answer => typeof a === "number");
        return { name: t.name, score: vals.length ? vals.reduce<number>((s, v) => s + Math.abs(v), 0) / vals.length : 0 };
      })
      .filter((t) => t.score >= 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((t) => `«${t.name}»`);
    return byTopic.length ? new Intl.ListFormat(locale, { type: "conjunction" }).format(byTopic) : "";
  }, [data, answers, locale]);

  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
  const days = data.reveal ? Math.ceil((new Date(`${data.reveal}T00:00:00`).getTime() - now) / 86_400_000) : 0;

  async function copy(url: string, done: string) {
    try {
      await navigator.clipboard.writeText(url);
      setNote(done);
    } catch {
      setNote(url);
    }
  }

  function privateLink() {
    const code = encodeSaved({ province, answers, tokens }, data.questions.map((q) => q.id), data.topics.map((t) => t.id));
    void copy(`${location.origin}/${locale}/${data.electionId}${LINK_PREFIX}${code}`, c.linkCopied);
  }

  async function share() {
    const url = `${location.origin}/${locale}/r/${encodeCompass(data.electionId, point)}`;
    try {
      if (navigator.share) return await navigator.share({ title: "Escó", text: c.shareText, url });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    void copy(url, m.results.copied);
  }

  function clear() {
    if (confirm(c.clearConfirm)) onClear();
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href={`/${locale}`} aria-label={m.nav.home} className="inline-flex min-h-11 items-center">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <LocaleSwitch />
          <ThemeToggle className="hover:bg-sunken" />
        </div>
      </header>

      {/* 1. El sobre: el resultat amb candidatures espera la data de revelació. */}
      <section aria-labelledby="cmp-h" className="relative mx-3 overflow-hidden rounded-[2rem] bg-stage px-6 py-12 text-chalk sm:mx-5 sm:px-12 sm:py-16">
        <Envelope className="absolute -right-10 -top-6 w-56 opacity-[0.07] sm:w-80" />
        <p className="kicker text-chalk-2">
          {ready ? c.readyKicker : c.kicker} · {data.name}
        </p>
        <h1 id="cmp-h" tabIndex={-1} className="display mt-4 max-w-[14ch] text-[clamp(2.8rem,1.8rem+4.5vw,5.6rem)] outline-none">
          {ready ? c.readyTitle : c.sealedTitle}
        </h1>
        {ready ? (
          <>
            <p className="mt-5 max-w-[46ch] text-lg text-chalk-2">{format(c.readyText, { n: voted })}</p>
            <button type="button" onClick={onOpen} className="btn mt-7 bg-chalk px-8 text-lg text-stage">
              {c.open} <span aria-hidden>→</span>
            </button>
          </>
        ) : (
          <>
            <p className="mt-5 max-w-[50ch] text-lg text-chalk-2">
              {format(c.sealedText, { date: data.reveal ? dateFmt.format(new Date(`${data.reveal}T00:00:00`)) : "" })}
            </p>
            <p className="kicker mt-6 inline-flex rounded-full border border-chalk-3/60 px-3 py-1.5 text-chalk">
              {days > 0 ? format(days === 1 ? c.days.one : c.days.other, { n: days }) : c.soon}
            </p>
          </>
        )}
        {restored && <p className="mt-6 text-sm text-chalk-2">{c.restored}</p>}
      </section>

      <main className="mx-auto grid max-w-3xl gap-14 px-5 pb-20 pt-12 sm:px-8">
        {/* 2. La brúixola. */}
        <section aria-labelledby="cmp-compass" className="grid gap-5">
          <h2 id="cmp-compass" className="font-serif text-[2rem] leading-tight">
            {c.compassTitle}
          </h2>
          <p className="text-ink-2">{format(c.compassLead, { n: voted })}</p>
          {sentence ? <p className="font-serif text-2xl leading-snug">{sentence}.</p> : <p className="text-ink-2">{c.notEnough}</p>}
          <div className="grid gap-4">
            {axes.map((a) => (
              <AxisBar key={a} axis={a} value={point[a]} />
            ))}
          </div>
          {strongest && <p className="text-ink-2">{format(c.strongest, { topics: strongest })}</p>}
          <p className="border-l-2 border-ink pl-4 text-sm text-ink-2">
            {c.relative}{" "}
            <Link href={`/${locale}/metodologia`} className="underline decoration-ink-3 underline-offset-4">
              {m.results.how}
            </Link>
          </p>
          <details className="group">
            <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium underline decoration-ink-3 underline-offset-4">{c.showMap}</summary>
            <div className="mt-4">
              <PoliticalMap points={[{ id: "you", label: m.results.you, point, you: true }]} axes={axes} />
            </div>
          </details>
        </section>

        {/* 3. Repassar i canviar respostes. */}
        <section aria-labelledby="cmp-review" className="grid gap-4">
          <h2 id="cmp-review" className="font-serif text-[2rem] leading-tight">
            {c.reviewTitle}
          </h2>
          <button type="button" aria-expanded={review} onClick={() => setReview(!review)} className="btn justify-self-start">
            {review ? c.reviewHide : c.review}
          </button>
          {review && (
            <div className="grid gap-10">
              <p className="text-sm text-ink-2">
                {c.reviewHint} {format(c.tokensLeft, { n: TOKENS - used })}
              </p>
              {data.topics.map((t) => {
                const qs = data.questions.filter((q) => q.topic === t.id);
                if (!qs.length) return null;
                const n = tokens[t.id] ?? 0;
                return (
                  <fieldset key={t.id} className="grid gap-5 border-t-2 border-ink pt-4">
                    <legend className="sr-only">{t.name}</legend>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="kicker text-ink-2">{t.name}</h3>
                      <span className="inline-flex items-center gap-2 text-sm">
                        <button type="button" onClick={() => onToken(t.id, -1)} disabled={n === 0} aria-label={format(c.less, { topic: t.name })} className="grid size-11 place-items-center rounded-full border border-ink-3 disabled:opacity-30">
                          −
                        </button>
                        <span className="num min-w-[7.5rem] text-center">{format(c.tokensLabel, { n })}</span>
                        <button type="button" onClick={() => onToken(t.id, 1)} disabled={used >= TOKENS} aria-label={format(c.more, { topic: t.name })} className="grid size-11 place-items-center rounded-full border border-ink-3 disabled:opacity-30">
                          +
                        </button>
                      </span>
                    </div>
                    {qs.map((q) => (
                      <div key={q.id} role="radiogroup" aria-label={q.text} className="grid gap-2.5">
                        <p className="font-serif text-xl leading-snug">{q.text}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[...VALUES, null].map((v) => {
                            const on = answers[q.id] === v;
                            return (
                              <button
                                key={String(v)}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => onAnswer(q.id, v)}
                                className={`min-h-11 rounded-full border px-3.5 text-sm transition-colors ${
                                  on ? "border-ink bg-ink text-paper" : "border-ink-3 text-ink-2 hover:border-ink hover:text-ink"
                                }`}
                              >
                                {v === null ? m.game.skip : m.game.votes[String(v) as "0"]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </fieldset>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. Desar i compartir. */}
        <section aria-labelledby="cmp-save" className="grid gap-4 border-t-2 border-ink pt-8">
          <h2 id="cmp-save" className="sr-only">
            {c.saveTitle}
          </h2>
          <p className="flex items-start gap-2 text-ink-2">
            <span aria-hidden className="mt-0.5">✓</span>
            {c.savedHere}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={privateLink} className="btn bg-ink text-paper">
              {c.link}
            </button>
            {point.economic !== undefined && (
              <button type="button" onClick={share} className="btn">
                {c.share}
              </button>
            )}
          </div>
          <p aria-live="polite" className="min-h-6 break-all text-sm font-medium">
            {note}
          </p>
          <p className="text-sm text-ink-2">{c.linkText}</p>
          <p className="text-sm text-ink-2">{c.shareNote}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <button type="button" onClick={onReplay} className="inline-flex min-h-11 items-center font-medium underline decoration-ink-3 underline-offset-4">
              {c.replay}
            </button>
            <button type="button" onClick={clear} className="inline-flex min-h-11 items-center text-sm text-ink-2 underline decoration-ink-3 underline-offset-4">
              {c.clear}
            </button>
          </div>
          <p className="max-w-[60ch] border-l-2 border-ink pl-4 text-sm text-ink-2">{m.results.disclaimer}</p>
        </section>
      </main>
    </div>
  );
}

function AxisBar({ axis, value }: { axis: Axis; value: number | undefined }) {
  const { m } = useI18n();
  const a = m.results.axes[axis];
  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-semibold">{a.name}</span>
      <div className="relative h-2.5 rounded-full bg-sunken" role="img" aria-label={value === undefined ? m.compass.notEnough : `${a.name}: ${a.neg} ↔ ${a.pos}`}>
        <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-ink-3" />
        {value !== undefined && (
          <span aria-hidden className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-ink" style={{ left: `${(value + 1) * 50}%` }} />
        )}
      </div>
      <span className="flex justify-between text-xs text-ink-2">
        <span>{a.neg}</span>
        <span>{a.pos}</span>
      </span>
    </div>
  );
}

// Sobre tancat: només decoració.
function Envelope({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
      <rect x="4" y="4" width="112" height="72" rx="6" />
      <path d="M4 10 60 46 116 10" />
    </svg>
  );
}
