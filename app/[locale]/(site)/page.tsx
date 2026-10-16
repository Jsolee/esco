import { notFound } from "next/navigation";
import { Hemicycle } from "@/components/Hemicycle";
import { Start, type ElectionSummary } from "@/components/Start";
import { DATA } from "@/lib/data";
import { FILL, SEATS } from "@/lib/hemicycle";
import { getMessages, isLocale } from "@/lib/i18n";
import { pad2, tx } from "@/lib/text";

const YOU = FILL.find((i) => SEATS[i].row === 6)!;

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
    .map(({ election, questions, candidacies }) => ({
      id: election.id,
      name: tx(election.name, locale),
      date: election.date,
      status: election.status,
      fictional: election.fictional,
      scope: election.scope,
      statements: questions.length,
      circs: candidacies.map((c) => c.circumscriptions),
    }));
  const [titleA, titleB] = m.landing.title.split(/(?<=\.)\s/);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-end gap-12 px-5 pt-8 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="kicker text-ink-2">{m.landing.kicker}</p>
          <h1 className="display mt-5 text-[clamp(3.4rem,1.9rem+6.4vw,7.6rem)]">
            {titleA} <em className="italic">{titleB}</em>
          </h1>
          <p className="mt-7 max-w-[36ch] text-xl leading-snug text-ink-2">{m.landing.lead}</p>
          <Start provinces={provinces} communities={communities} elections={elections} />
          <p className="mt-6 max-w-[48ch] text-sm text-ink-3">{m.landing.note}</p>
        </div>
        <figure className="relative mx-auto w-full max-w-xl text-ink lg:mb-24">
          <Hemicycle
            className="seats-in w-full"
            seat={(i) => ({ fill: "var(--ink)", opacity: 0.1 + SEATS[i].row * 0.028 })}
            you={YOU}
          />
          <figcaption className="kicker mt-3 text-center text-ink-2">{m.landing.yourSeat}</figcaption>
        </figure>
      </section>

      <section className="mx-auto mt-28 max-w-6xl px-5 sm:px-8" aria-labelledby="steps">
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

      <section className="mx-auto mt-20 max-w-6xl px-5 sm:px-8" aria-labelledby="rules">
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
    </>
  );
}
