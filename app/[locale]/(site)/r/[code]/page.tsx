import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMessages, isLocale } from "@/lib/i18n";
import { sentenceOf } from "@/lib/compass";
import { AXES } from "@/lib/match";
import { resolveCompass, resolveShare } from "@/lib/shared";
import { tx } from "@/lib/text";

export async function generateMetadata({ params }: PageProps<"/[locale]/r/[code]">): Promise<Metadata> {
  const { locale, code } = await params;
  const s = resolveShare(code);
  const b = s ? null : resolveCompass(code);
  if (!isLocale(locale) || (!s && !b)) return {};
  const m = getMessages(locale);
  if (b) return { title: m.shared.compassTitle, robots: { index: false }, description: sentenceOf(b.point, AXES.filter((a) => b.axes.includes(a)), m.compass.levels) };
  if (!s) return {};
  return { title: m.shared.title, robots: { index: false }, description: s.rows.map((r) => `${r.name} ${r.affinity}%`).join(" · ") };
}

export default async function SharedPage({ params }: PageProps<"/[locale]/r/[code]">) {
  const { locale, code } = await params;
  const s = resolveShare(code);
  const b = s ? null : resolveCompass(code);
  if ((!s && !b) || !isLocale(locale)) notFound();
  const m = getMessages(locale);
  if (b) {
    const axes = AXES.filter((a) => b.axes.includes(a));
    return (
      <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-16">
        <p className="kicker text-ink-2">
          {m.shared.compassTitle} · {tx(b.election.name, locale)}
        </p>
        <h1 className="display mt-4 text-[clamp(2.2rem,1.4rem+3vw,3.6rem)]">{m.shared.compassLead}</h1>
        <p className="mt-6 font-serif text-2xl leading-snug">{sentenceOf(b.point, axes, m.compass.levels)}.</p>
        <div className="mt-10 grid gap-5 border-t-2 border-ink pt-6">
          {axes.map((a) => {
            const v = b.point[a];
            const ax = m.results.axes[a];
            return (
              <div key={a} className="grid gap-1.5">
                <span className="text-sm font-semibold">{ax.name}</span>
                <div className="relative h-2.5 rounded-full bg-sunken">
                  <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-ink-3" />
                  {v !== undefined && (
                    <span aria-hidden className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-ink" style={{ left: `${(v + 1) * 50}%` }} />
                  )}
                </div>
                <span className="flex justify-between text-xs text-ink-2">
                  <span>{ax.neg}</span>
                  <span>{ax.pos}</span>
                </span>
              </div>
            );
          })}
        </div>
        <Link href={`/${locale}`} className="btn mt-10 bg-ink px-8 text-lg text-paper">
          {m.shared.cta} <span aria-hidden>→</span>
        </Link>
        <p className="mt-6 text-sm text-ink-2">{m.compass.relative}</p>
      </div>
    );
  }
  if (!s) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-16">
      {s.election.fictional && (
        <p className="mb-8 flex flex-wrap gap-x-3 border-2 border-dashed border-ink px-4 py-2.5 text-sm">
          <strong className="kicker">{m.game.fictional}</strong> {m.game.fictionalBanner}
        </p>
      )}
      <p className="kicker text-ink-2">
        {m.shared.title} · {tx(s.election.name, locale)}
      </p>
      <h1 className="display mt-4 text-[clamp(2.6rem,1.6rem+4vw,4.6rem)]">{m.shared.lead}</h1>
      <ol className="mt-10 border-t-2 border-ink">
        {s.rows.map((r) => (
          <li key={r.id} className="grid gap-2 border-b border-rule py-4">
            <p className="flex items-baseline justify-between gap-4">
              <span className="text-lg font-semibold">
                <span className="num mr-3 font-serif font-light text-ink-3">
                  {/* els empats comparteixen posició, com a la pantalla de resultats */}
                  {s.rows.filter((x) => x.affinity === r.affinity).length > 1 && "="}
                  {s.rows.findIndex((x) => x.affinity === r.affinity) + 1}
                </span>
                {r.name}
              </span>
              <span className="num font-serif text-3xl font-light">{r.affinity}%</span>
            </p>
            <div className="h-2.5 bg-sunken">
              <div className="bar-grow h-full outline outline-1 -outline-offset-1 outline-ink" style={{ width: `${r.affinity}%`, background: r.color }} />
            </div>
          </li>
        ))}
      </ol>
      <Link href={`/${locale}`} className="btn mt-10 bg-ink px-8 text-lg text-paper">
        {m.shared.cta} <span aria-hidden>→</span>
      </Link>
      <p className="mt-6 text-sm text-ink-3">{m.shared.note}</p>
    </div>
  );
}
