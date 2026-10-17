import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameLoader } from "@/components/game/GameLoader";
import { DATA, getElection } from "@/lib/data";
import type { GameData } from "@/lib/game";
import { isLocale } from "@/lib/i18n";
import { axesOf, positionsOf } from "@/lib/match";
import { tx } from "@/lib/text";

export const dynamicParams = false;
// Es poden jugar les eleccions obertes i les que estan en mode brúixola; les properes surten a la portada sense enllaç.
const playable = (status: string) => status === "open" || status === "preview";
export const generateStaticParams = () =>
  DATA.elections.filter((e) => playable(e.election.status)).map((e) => ({ election: e.election.id }));

export async function generateMetadata({ params }: PageProps<"/[locale]/[election]">): Promise<Metadata> {
  const { locale, election } = await params;
  const e = getElection(election);
  return e && isLocale(locale) ? { title: tx(e.election.name, locale) } : {};
}

export default async function ElectionPage({ params }: PageProps<"/[locale]/[election]">) {
  const { locale, election: id } = await params;
  const e = getElection(id);
  if (!e || !playable(e.election.status) || !isLocale(locale)) notFound();
  // En mode brúixola les posicions de les candidatures no arriben al navegador fins a la revelació.
  const preview = e.election.status === "preview";

  const usedTopics = new Set(e.questions.map((q) => q.topic));
  const data: GameData = {
    electionId: e.election.id,
    reveal: preview ? e.election.reveal : undefined,
    name: tx(e.election.name, locale),
    fictional: e.election.fictional,
    axes: e.election.axes,
    facts: e.election.facts.map((f) => tx(f, locale)),
    questions: e.questions.map((q) => ({
      id: q.id,
      topic: q.topic,
      text: tx(q.text, locale),
      context: tx(q.context, locale),
      axes: q.axes,
      budget: q.budget,
    })),
    funding: e.election.funding.map((f) => ({
      id: f.id,
      kind: f.kind,
      topic: f.topic,
      name: tx(f.name, locale),
      detail: tx(f.detail, locale),
      capacity: f.capacity,
      axes: f.axes,
    })),
    topics: DATA.topics.filter((t) => usedTopics.has(t.id)).map((t) => ({ id: t.id, name: tx(t.name, locale) })),
    candidacies: (preview ? [] : e.candidacies).map((c) => ({
      id: c.id,
      name: c.name,
      short: c.short,
      color: c.color,
      members: c.members,
      circumscriptions: c.circumscriptions,
      positions: c.positions as GameData["candidacies"][number]["positions"],
      sources: Object.fromEntries(c.sources.map((s) => [s.id, { title: s.title, url: s.url, lang: s.lang }])),
      axes: axesOf([...e.questions, ...e.election.funding], positionsOf(c), 0.5),
    })),
    provinces: DATA.territory.provinces
      .map((p) => ({ id: p.id, name: tx(p.name, locale) }))
      .sort((a, b) => a.name.localeCompare(b.name, locale)),
  };

  return (
    <div className="min-h-dvh bg-stage text-chalk">
      <GameLoader data={data} />
    </div>
  );
}
