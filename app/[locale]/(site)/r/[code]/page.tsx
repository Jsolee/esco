import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMessages, isLocale } from "@/lib/i18n";
import { resolveShare } from "@/lib/shared";
import { format, tx } from "@/lib/text";

export async function generateMetadata({ params }: PageProps<"/[locale]/r/[code]">): Promise<Metadata> {
  const { locale, code } = await params;
  const s = resolveShare(code);
  if (!s || !isLocale(locale)) return {};
  const m = getMessages(locale);
  return { title: m.shared.title, robots: { index: false }, description: s.rows.map((r) => `${r.name} ${r.affinity}%`).join(" · ") };
}

export default async function SharedPage({ params }: PageProps<"/[locale]/r/[code]">) {
  const { locale, code } = await params;
  const s = resolveShare(code);
  if (!s || !isLocale(locale)) notFound();
  const m = getMessages(locale);

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
      <h1 className="display mt-4 text-[clamp(2.6rem,1.6rem+4vw,4.6rem)]">{format(m.shared.lead, { n: s.questions })}</h1>
      <ol className="mt-10 border-t-2 border-ink">
        {s.rows.map((r, i) => (
          <li key={r.id} className="grid gap-2 border-b border-rule py-4">
            <p className="flex items-baseline justify-between gap-4">
              <span className="text-lg font-semibold">
                <span className="num mr-3 font-serif font-light text-ink-3">{i + 1}</span>
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
