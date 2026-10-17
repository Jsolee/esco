import { notFound } from "next/navigation";
import { Hero, Reveal, Ticker } from "@/components/Hero";
import type { ElectionSummary } from "@/components/Start";
import { DATA } from "@/lib/data";
import { getMessages, isLocale } from "@/lib/i18n";
import { pad2, tx } from "@/lib/text";


export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);

  const provinces = DATA.territory.provinces.map((p) => ({
    id: p.id,
    name: tx(p.name, locale),
    community: p.community,
    aliases: [...new Set([p.name.ca, p.name.es, ...p.aliases])],
  }));
  const communities = Object.fromEntries(DATA.territory.communities.map((c) => [c.id, tx(c.name, locale)]));
  const elections: ElectionSummary[] = DATA.elections
    .filter((e) => e.election.status !== "archived")
    // primer les eleccions reals, després les de prova
    .sort((a, b) => Number(a.election.fictional) - Number(b.election.fictional))
    .map(({ election, questions, candidacies }) => ({
      id: election.id,
      name: tx(election.name, locale),
      date: election.date,
      status: election.status,
      reveal: election.reveal,
      fictional: election.fictional,
      scope: election.scope,
      statements: questions.length,
      circs: candidacies.map((c) => c.circumscriptions),
    }));

  return (
    <>
      <Hero
        kicker={m.landing.kicker}
        title={m.landing.title}
        lead={m.landing.lead}
        note={m.landing.note}
        yourSeat={m.landing.yourSeat}
        provinces={provinces}
        communities={communities}
        elections={elections}
      />
      <Ticker items={DATA.topics.map((t) => tx(t.name, locale))} />

      <Reveal className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
      <section aria-labelledby="steps">
        <h2 id="steps" className="kicker text-ink-2">
          {m.landing.stepsTitle}
        </h2>
        <ol className="mt-4 grid border-t-2 border-ink sm:grid-cols-3">
          {m.landing.steps.map((s, i) => (
            <li key={s.title} className="grid gap-2 border-b border-rule py-7 sm:border-b-0 sm:pr-8">
              <span className="num font-serif text-5xl font-light text-ink-3">{pad2(i + 1)}</span>
              <h3 className="font-serif text-3xl">{s.title}</h3>
              <p className="max-w-[34ch] text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
      </Reveal>

      <Reveal className="mx-auto mt-20 max-w-6xl px-5 sm:px-8">
      <section aria-labelledby="rules">
        <h2 id="rules" className="kicker text-ink-2">
          {m.landing.principlesTitle}
        </h2>
        <div className="mt-4 grid gap-8 sm:grid-cols-3">
          {m.landing.principles.map((p) => (
            <article key={p.title} className="grid content-start gap-2 border-t border-ink pt-4">
              <h3 className="font-serif text-2xl italic">{p.title}</h3>
              <p className="text-ink-2">{p.text}</p>
            </article>
          ))}
        </div>
      </section>
      </Reveal>
    </>
  );
}
