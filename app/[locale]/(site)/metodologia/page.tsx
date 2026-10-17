import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, isLocale } from "@/lib/i18n";
import { MIN_COVERAGE } from "@/lib/match";

export async function generateMetadata({ params }: PageProps<"/[locale]/metodologia">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getMessages(locale).footer.method } : {};
}

const pct = `${MIN_COVERAGE * 100} %`;

const Formula = () => (
  <pre className="overflow-x-auto bg-sunken p-5 text-sm leading-relaxed">
    {`D        = Σ pes(q) · |tu(q) − c(q)|
Dmàx     = Σ pes(q) · 4
afinitat = arrodonit(100 · (1 − D / Dmàx))`}
  </pre>
);

const CONTENT = {
  ca: {
    title: "Com funciona Escó",
    lead: "Escó compara les teves respostes amb les posicions que cada candidatura ha publicat. No recomana cap partit: et mostra amb qui coincideixes i on ho diu cada programa.",
    sections: [
      {
        h: "Les propostes",
        body: [
          "Cada elecció té un conjunt d'afirmacions sobre temes que divideixen els partits. Es redacten en to neutre i cada una porta un context breu, també neutre, que pots llegir girant la carta.",
          "L'ordre de les propostes és aleatori per a cada sessió, perquè cap tema no surti sempre primer.",
        ],
      },
      {
        h: "Les posicions de les candidatures",
        body: [
          "Per a cada afirmació, cada candidatura té un valor de −2 (molt en desacord) a +2 (molt d'acord), o bé «no s'hi pronuncia». Cada valor porta la font: el document, la pàgina o un enllaç. Si una candidatura no diu res sobre un tema, no s'hi inventa cap posició.",
          "Les posicions surten del programa electoral, d'una votació nominal del Congrés o d'una declaració pública del partit. En una votació, votar-hi a favor o en contra compta com a d'acord o en desacord; abstenir-se, com a neutral; i ser l'autor de la iniciativa, o votar la llei que fa exactament el que diu l'afirmació, com a molt d'acord o molt en desacord.",
          "Les coalicions poden canviar segons el territori; per això les candidatures es defineixen per circumscripció.",
        ],
      },
      {
        h: "El càlcul de l'afinitat",
        body: [
          "Per a cada candidatura es mesura la distància entre la teva resposta i la seva, proposta per proposta, i es converteix en un percentatge de 0 a 100. Les propostes dels temes on poses fitxes d'influència pesen més.",
          "«Neutral» és una resposta i compta. «Salta» no compta. Si una candidatura no es pronuncia sobre una proposta, aquella proposta no entra al seu càlcul.",
          `Perquè una candidatura amb molt poques posicions no surti amunt per casualitat, cal que es pronunciï com a mínim sobre el ${pct} de les propostes que has votat per entrar al rànquing. La resta es mostra a part.`,
          "Els empats es decideixen sobre la xifra arrodonida, la que veus. Les candidatures empatades comparteixen posició i s'ordenen amb l'ordre aleatori de la sessió.",
        ],
        formula: true,
      },
      {
        h: "El pressupost",
        body: [
          "Escó és un simulador de mandat: els diners són limitats. Algunes propostes tenen cost (gastar més o cobrar menys impostos) i altres n'aporten (ingressos nous). Si votes a favor d'una proposta amb cost i no tens marge, has de dir d'on surten els diners: retallar un altre àmbit, pujar un impost o endeutar-te. Si no, la proposta no tira endavant.",
          "Cada font de finançament compta com una resposta: fer-la servir equival a estar-hi d'acord, i fer-la servir a fons, a estar-hi molt d'acord. Les candidatures també hi tenen posició, i el càlcul de l'afinitat les compara igual que les afirmacions.",
          "En aquesta versió els costos són punts orientatius i fictics. En una elecció real, cada cost ha de sortir d'una font neutral, com l'AIReF o la memòria econòmica dels programes.",
        ],
      },
      {
        h: "La teva influència",
        body: [
          "Al final reparteixes 10 fitxes entre els temes. Cada fitxa fa que les propostes d'aquell tema pesin mig punt més al càlcul (sense fitxes, pes 1; amb 2 fitxes, pes 2). Com que les fitxes són limitades, posar-ne moltes en un tema vol dir no posar-ne en un altre.",
        ],
      },
      {
        h: "El mapa i l'hemicicle",
        body: [
          "Cada proposta pot contribuir a un o més eixos: econòmic (esquerra–dreta), social (liberal–conservador) i territorial. La posició de cada punt és la mitjana de les respostes ponderada per aquesta contribució. Les fitxes no et mouen al mapa.",
          "L'hemicicle reparteix 350 escons amb el sistema D'Hondt fent servir la teva afinitat com si fossin vots. És una manera visual de llegir el mateix rànquing, no una predicció electoral.",
        ],
      },
      {
        h: "Privacitat",
        body: [
          "Tot el càlcul es fa al teu navegador. No hi ha comptes, galetes de seguiment ni cap servidor que rebi les respostes. El progrés es desa a la memòria de la pestanya i s'esborra quan la tanques.",
          "La província només serveix per saber quines candidatures es presenten on votes, i tampoc no surt del navegador. Si comparteixes el resultat, l'enllaç només conté les candidatures i els percentatges arrodonits.",
        ],
      },
      {
        h: "Límits",
        body: [
          "Un qüestionari no recull tot el que importa d'un programa ni la credibilitat de qui el presenta. Fes servir el resultat com a punt de partida per informar-te, no com a consell de vot.",
          "Aquesta versió fa servir dades fictícies per provar l'eina: els partits, les posicions i les fonts són inventats.",
        ],
      },
    ],
  },
  es: {
    title: "Cómo funciona Escó",
    lead: "Escó compara tus respuestas con las posiciones que ha publicado cada candidatura. No recomienda ningún partido: te muestra con quién coincides y dónde lo dice cada programa.",
    sections: [
      {
        h: "Las propuestas",
        body: [
          "Cada elección tiene un conjunto de afirmaciones sobre temas que dividen a los partidos. Se redactan en tono neutro y cada una lleva un contexto breve, también neutro, que puedes leer girando la carta.",
          "El orden de las propuestas es aleatorio en cada sesión, para que ningún tema salga siempre primero.",
        ],
      },
      {
        h: "Las posiciones de las candidaturas",
        body: [
          "Para cada afirmación, cada candidatura tiene un valor de −2 (muy en desacuerdo) a +2 (muy de acuerdo), o bien «no se pronuncia». Cada valor lleva su fuente: el documento, la página o un enlace. Si una candidatura no dice nada sobre un tema, no se le inventa ninguna posición.",
          "Las posiciones salen del programa electoral, de una votación nominal del Congreso o de una declaración pública del partido. En una votación, votar a favor o en contra cuenta como de acuerdo o en desacuerdo; abstenerse, como neutral; y ser el autor de la iniciativa, o votar la ley que hace exactamente lo que dice la afirmación, como muy de acuerdo o muy en desacuerdo.",
          "Las coaliciones pueden cambiar según el territorio; por eso las candidaturas se definen por circunscripción.",
        ],
      },
      {
        h: "El cálculo de la afinidad",
        body: [
          "Para cada candidatura se mide la distancia entre tu respuesta y la suya, propuesta por propuesta, y se convierte en un porcentaje de 0 a 100. Las propuestas de los temas donde pones fichas de influencia pesan más.",
          "«Neutral» es una respuesta y cuenta. «Salta» no cuenta. Si una candidatura no se pronuncia sobre una propuesta, esa propuesta no entra en su cálculo.",
          `Para que una candidatura con muy pocas posiciones no suba por casualidad, tiene que pronunciarse como mínimo sobre el ${pct} de las propuestas que has votado para entrar en el ranking. El resto se muestra aparte.`,
          "Los empates se deciden sobre la cifra redondeada, la que ves. Las candidaturas empatadas comparten posición y se ordenan con el orden aleatorio de la sesión.",
        ],
        formula: true,
      },
      {
        h: "El presupuesto",
        body: [
          "Escó es un simulador de mandato: el dinero es limitado. Algunas propuestas tienen coste (gastar más o cobrar menos impuestos) y otras aportan (ingresos nuevos). Si votas a favor de una propuesta con coste y no tienes margen, tienes que decir de dónde sale el dinero: recortar otro ámbito, subir un impuesto o endeudarte. Si no, la propuesta no sale adelante.",
          "Cada fuente de financiación cuenta como una respuesta: usarla equivale a estar de acuerdo, y usarla a fondo, a estar muy de acuerdo. Las candidaturas también tienen posición, y el cálculo de la afinidad las compara igual que las afirmaciones.",
          "En esta versión los costes son puntos orientativos y ficticios. En una elección real, cada coste debe salir de una fuente neutral, como la AIReF o la memoria económica de los programas.",
        ],
      },
      {
        h: "Tu influencia",
        body: [
          "Al final repartes 10 fichas entre los temas. Cada ficha hace que las propuestas de ese tema pesen medio punto más en el cálculo (sin fichas, peso 1; con 2 fichas, peso 2). Como las fichas son limitadas, poner muchas en un tema significa no ponerlas en otro.",
        ],
      },
      {
        h: "El mapa y el hemiciclo",
        body: [
          "Cada propuesta puede contribuir a uno o más ejes: económico (izquierda–derecha), social (liberal–conservador) y territorial. La posición de cada punto es la media de las respuestas ponderada por esa contribución. Las fichas no te mueven en el mapa.",
          "El hemiciclo reparte 350 escaños con el sistema D'Hondt usando tu afinidad como si fueran votos. Es una forma visual de leer el mismo ranking, no una predicción electoral.",
        ],
      },
      {
        h: "Privacidad",
        body: [
          "Todo el cálculo se hace en tu navegador. No hay cuentas, cookies de seguimiento ni ningún servidor que reciba las respuestas. El progreso se guarda en la memoria de la pestaña y se borra al cerrarla.",
          "La provincia solo sirve para saber qué candidaturas se presentan donde votas, y tampoco sale del navegador. Si compartes el resultado, el enlace solo contiene las candidaturas y los porcentajes redondeados.",
        ],
      },
      {
        h: "Límites",
        body: [
          "Un cuestionario no recoge todo lo que importa de un programa ni la credibilidad de quien lo presenta. Usa el resultado como punto de partida para informarte, no como consejo de voto.",
          "Esta versión usa datos ficticios para probar la herramienta: los partidos, las posiciones y las fuentes son inventados.",
        ],
      },
    ],
  },
} as const;

export default async function Method({ params }: PageProps<"/[locale]/metodologia">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = CONTENT[locale];
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-16">
      <h1 className="display text-[clamp(2.8rem,1.8rem+4vw,5rem)]">{c.title}</h1>
      <p className="mt-6 text-xl leading-snug text-ink-2">{c.lead}</p>
      {c.sections.map((s) => (
        <section key={s.h} className="mt-12 grid gap-4 border-t-2 border-ink pt-5">
          <h2 className="font-serif text-3xl">{s.h}</h2>
          {s.body.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-[64ch]">
              {p}
            </p>
          ))}
          {"formula" in s && <Formula />}
        </section>
      ))}
    </article>
  );
}
