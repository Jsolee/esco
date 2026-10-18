# Marca d'Escó

## Idea

Escó és un orientador de vot en format de joc. Et dona un escó al Congrés i hi votes 24 propostes: sí, no o abstenció. Tens 3 línies vermelles per al que no negociaries, i quan una proposta ja s'ha votat al Congrés, en veus el resultat real. Al final veus quines candidatures voten com tu. La marca és la d'un diari seriós que ha fet un joc: blanc i negre, tipografia editorial i cap color de partit.

## Logo

El símbol és un hemicicle de set escons, i el del mig és el teu: és més gran i és l'únic encès.

| Fitxer | Ús |
|---|---|
| `logo/esco-symbol-on-dark.svg` / `.png` | Símbol sobre fons fosc (per defecte) |
| `logo/esco-symbol-on-light.svg` / `.png` | Símbol sobre fons clar |
| `logo/esco-symbol-mono-*.svg` | Una sola tinta (segells, gravat, favicon petit) |
| `logo/esco-lockup-on-dark.png` / `on-light.png` | Símbol + «Escó» en horitzontal |
| `logo/esco-stacked-on-dark.png` | Símbol sobre el nom, per a formats quadrats |

- El nom s'escriu **Escó**, amb accent i majúscula inicial, en Newsreader cursiva. Mai «ESCO», «Esco» ni «escó» com a logo.
- Espai de respecte: l'alçada de l'escó central a cada banda.
- Mida mínima del símbol: 16 px. Per sota, la versió mono.
- No ho facis: canviar el color de l'escó central, posar-hi colors de partit, girar-lo, afegir-hi ombres o contorns, posar-lo sobre fotos sense una capa fosca.

## Colors

Tot és monocrom. Els colors dels partits només surten a la pantalla de resultats de l'app, sempre amb el nom al costat. Cap peça promocional no en fa servir.

| Nom | Hex | Ús |
|---|---|---|
| Nit | `#0C0C0B` | Fons principal |
| Fum | `#1A1917` | Superfícies sobre Nit, xips |
| Grafit | `#8E8C85` | Text secundari, peus |
| Guix | `#F2F1EC` | Text i símbol sobre fosc |
| Carta | `#F7F6F2` | Cartes de votació |
| Paper | `#FBFBFA` | Fons clar |
| Tinta | `#0E0E0D` | Text i símbol sobre clar |

## Tipografia

- **Newsreader** (serif): titulars, afirmacions i el nom. La cursiva serveix per a la segona línia d'un eslògan («Tens un escó. / *Fes-lo servir.*»).
- **Schibsted Grotesk** (sans): etiquetes en majúscules amb espaiat, botons i text de suport.

Totes dues són de Google Fonts amb llicència OFL. A `fonts/` hi ha els subconjunts llatins que fa servir l'app.

## Veu

- Parlem de tu, amb frases curtes i verbs: «Vota», «Paga-ho», «Descobreix».
- Neutral sempre: cap adjectiu que valori una proposta, cap partit més amunt que un altre, cap «hauries de votar».
- Cada xifra porta la font (LOREG, AIReF, programa i pàgina).
- Es pot fer broma amb el joc, mai amb les persones ni amb els partits.

Eslògans:

- **Tens un escó. Fes-lo servir.** (principal)
- **Tres línies vermelles.** (el que no negocies pesa el triple)
- **Cada sí té un preu.** Només per a eleccions amb simulador de pressupost. Les generals del 29-N no en tenen, i no s'ha de fer servir per promocionar-les.
- **Qui vota com tu?** (resultats)
- **Neutral · Privat · Amb fonts** (segell)

## Xarxes i domini

- **Web:** `https://escon.app`.
- **Usuari:** **@esconapp** a Instagram, TikTok, Threads, X i YouTube. Sense punt, perquè X no l'admet i «escon.app» es converteix en un enllaç dins dels textos.
- **Nom visible:** la marca continua sent **Escó**. `escon` és només l'adreça, perquè `esco` ja estava agafat i Instagram no admet accents.
- **Nom del perfil:** `Escó · Test de voto 29N`. Es pot canviar després del 29-N; per això el nom d'usuari no porta ni l'elecció ni l'any.
- **Categoria:** «Sitio web» o «Aplicación», mai una de política.

Bio principal en castellà, perquè les generals són de tot l'Estat. El català va a les històries i als posts:

```
Tienes un escaño. Úsalo.
Vota 24 propuestas y descubre qué partidos votan como tú.
Neutral · Privado · Con fuentes
👇 Juega antes del 29-N
```

Enllaç de la bio: `https://escon.app`.

Foto de perfil: `instagram/perfil-1080.png`.

Destacats, amb la seva portada a `instagram/destacat-*.png`: Com es juga · Línies vermelles · Metodologia · Privacitat · Novetats.

Primers continguts, en aquest ordre:

1. Reel de presentació (`../brag-output/brag.mp4`), fixat al perfil.
2. `post-01-llancament.png`: «Tens un escó. Fes-lo servir.»
3. `post-05-com-es-juga.png`: els tres passos.
4. `post-02-linies-vermelles.png`: les 3 línies vermelles.
5. `post-03-plantilla-proposta.png`: una proposta per setmana, amb enquesta a les històries.
6. `post-04-plantilla-sabies-que.png`: dades del sistema electoral, sempre amb font.

Etiquetes (poques i neutrals): `#Escó #EleccionsGenerals #EleccionesGenerales #VotaInformat`. Afegeix-hi `#29N` quan l'elecció real estigui oberta a l'app.

El 29-N ja es pot jugar en mode brúixola: fins al 3 de novembre el resultat és la brúixola i el vot queda «a l'urna». No es promociona fins que l'elecció estigui oberta amb les candidatures oficials (previst abans del 13/11). Fins llavors, no publiquis rànquings ni res que digui que ja es veuen les candidatures.

## Editar i exportar

`source/kit.html` conté totes les peces; cada `.board` és un fitxer. Per regenerar els PNG (cal Google Chrome):

```bash
brand/export.sh            # totes les peces
brand/export.sh historia   # només les que coincideixin
```

L'script serveix el kit en local i fa una captura a mida real de `kit.html#id`, una per peça. Per veure-les totes juntes, obre `kit.html` sense `#`.

| `id` | Mida | Fitxer |
|---|---|---|
| `symbol-dark`, `symbol-light` | 1024×1024 | `logo/esco-symbol-on-*.png` |
| `lockup-dark`, `lockup-light` | 2400×900 | `logo/esco-lockup-on-*.png` |
| `stacked-dark` | 1600×1600 | `logo/esco-stacked-on-dark.png` |
| `avatar` | 1080×1080 | `instagram/perfil-1080.png` |
| `hl-*` | 1080×1920 | `instagram/destacat-*.png` |
| `post-*` | 1080×1350 | `instagram/post-*.png` |
| `historia` | 1080×1920 | `instagram/historia-plantilla.png` |
| `full-de-marca` | 2400×1500 | `full-de-marca.png` |
