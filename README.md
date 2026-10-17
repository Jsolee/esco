# Escó

Orientador de vot per a l'Estat espanyol en format de joc. Tens un escó dins d'un hemicicle en 3D: votes 24 propostes lliscant cartes en tres rondes, encadenes ratxes i assoliments, marques els temes que més t'importen i, després del recompte, descobreixes quines candidatures han votat com tu, amb la font de cada posició.

> Aquesta versió fa servir **dades fictícies** (Partit A, Partit B…). Per posar-hi dades reals, vegeu [`DATA_GUIDE.md`](./DATA_GUIDE.md).

## Principis

- **Neutral.** Propostes i candidatures en ordre aleatori per sessió. Interfície acromàtica: el color de partit només apareix als resultats. Metodologia pública a `/metodologia`.
- **Privat.** Tot el càlcul es fa al navegador. Sense comptes, galetes de seguiment ni analítica. El progrés viu a `sessionStorage`; en el mode brúixola, les respostes es desen a `localStorage` del dispositiu i l'enllaç privat les porta després del `#`, que no arriba mai al servidor. La capçalera CSP (`connect-src 'self'`) impedeix enviar dades a altres dominis.
- **Verificable.** Cada posició porta document i pàgina o URL.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · GSAP (SplitText, Draggable, ScrollTrigger) · three.js · Zod 4 · Vitest

## Ordres

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # algorisme + validació de totes les dades
npm run build
```

## Estructura

```
app/[locale]/(site)/        portada, metodologia i resultat compartit (/r/[code] + imatge OG)
app/[locale]/[election]/    el joc: entrada → cartes → prioritats → recompte → resultats
components/game/            Game (estat, rondes, assoliments), Deck (cartes amb GSAP), Overlays (mall, rètols, assoliments), Results, PoliticalMap
components/three/           Chamber: l'hemicicle de 350 escons en three.js (amb SVG de reserva sense WebGL)
lib/match.ts                algorisme pur: afinitat, eixos, ordre aleatori, D'Hondt
lib/schema.ts               esquemes Zod de totes les dades
lib/data.ts                 càrrega i validació creuada de /data
data/                       territori, temes i eleccions (JSON)
messages/                   textos d'interfície en català i castellà
```

## Algorisme

Distància city-block normalitzada amb pesos: per a cada candidatura, sobre les propostes que has votat i on ella té posició,
`afinitat = 100 · (1 − Σ pes·|tu − ella| / Σ pes·4)`. Les saltades i els «no s'hi pronuncia» no compten; cal una cobertura mínima del 50 % per entrar al rànquing. Detalls i casos límit a `lib/match.ts` i `lib/match.test.ts`.

## Rendiment i accessibilitat

three.js es carrega en un fragment a part i només al client; mentre carrega, o si no hi ha WebGL, es mostra l'hemicicle en SVG. Amb `prefers-reduced-motion` no hi ha desplaçaments ni càmera en moviment. El so (sintetitzat amb WebAudio, sense fitxers) està desactivat per defecte. Totes les accions de lliscar tenen botó i tecla equivalents.

## Desplegament

Preparat per a Vercel sense configuració addicional. Totes les pàgines són estàtiques excepte `/[locale]/r/[code]`, que genera la imatge per compartir.
