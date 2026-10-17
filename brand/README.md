# Marca d'Escó

## Idea

Escó és un simulador de mandat: et dona un escó al Congrés, votes propostes, les has de pagar i al final veus quines candidatures voten com tu. La marca és la d'un diari seriós que ha fet un joc: blanc i negre, tipografia editorial i cap color de partit.

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

- **Newsreader** (serif): titulars, afirmacions i el nom. La cursiva serveix per a la segona línia d'un eslògan («Cada sí / *té un preu.*»).
- **Schibsted Grotesk** (sans): etiquetes en majúscules amb espaiat, botons i text de suport.

Totes dues són de Google Fonts amb llicència OFL. A `fonts/` hi ha els subconjunts llatins que fa servir l'app.

## Veu

- Parlem de tu, amb frases curtes i verbs: «Vota», «Paga-ho», «Descobreix».
- Neutral sempre: cap adjectiu que valori una proposta, cap partit més amunt que un altre, cap «hauries de votar».
- Cada xifra porta la font (LOREG, AIReF, programa i pàgina).
- Es pot fer broma amb el joc, mai amb les persones ni amb els partits.

Eslògans:

- **Tens un escó. Fes-lo servir.** (principal)
- **Cada sí té un preu.** (simulador de mandat)
- **Qui vota com tu?** (resultats)
- **Neutral · Privat · Amb fonts** (segell)

## Instagram

Noms d'usuari proposats, per ordre (no he comprovat si estan lliures): `@esco.vota`, `@escovota`, `@elteuesco`, `@esco.joc`.

Nom del perfil: `Escó · Simulador de mandat`

Bio (108 caràcters):

```
Tens un escó. Fes-lo servir.
Vota propostes, paga-les i mira qui vota com tu.
Neutral · Privat · Amb fonts
```

Enllaç: `https://esco-psi.vercel.app` (val la pena un domini propi abans de la campanya).

Foto de perfil: `instagram/perfil-1080.png`.

Destacats, amb la seva portada a `instagram/destacat-*.png`: Com es juga · Pressupost · Metodologia · Privacitat · Novetats.

Primers continguts, en aquest ordre:

1. Reel de presentació (`../brag-output/brag.mp4`), fixat al perfil.
2. `post-01-llancament.png`: «Tens un escó. Fes-lo servir.»
3. `post-05-com-es-juga.png`: els tres passos.
4. `post-02-cada-si-te-un-preu.png`: el simulador de mandat.
5. `post-03-plantilla-proposta.png`: una proposta per setmana, amb enquesta a les històries.
6. `post-04-plantilla-sabies-que.png`: dades del sistema electoral, sempre amb font.

Etiquetes (poques i neutrals): `#Escó #EleccionsGenerals #EleccionesGenerales #VotaInformat`. Afegeix-hi `#29N` quan l'elecció real estigui oberta a l'app.

Mentre l'elecció del 29-N no estigui oberta a l'app, no publiquis res que digui que ja es pot jugar amb les candidatures reals.

## Editar i exportar

`source/kit.html` conté totes les peces; cada `.board` és un fitxer. Per regenerar els PNG:

```bash
cd brand && python3 -m http.server 3007
```

Obre `http://localhost:3007/source/kit.html` i fes una captura de cada `.board` per `id` (per exemple, amb Playwright: `page.locator('#post-preu').screenshot({ path })`).

| `id` | Mida | Fitxer |
|---|---|---|
| `symbol-dark`, `symbol-light` | 1024×1024 | `logo/esco-symbol-on-*.png` |
| `lockup-dark`, `lockup-light` | 2400×900 | `logo/esco-lockup-on-*.png` |
| `stacked-dark` | 1600×1600 | `logo/esco-stacked-on-dark.png` |
| `avatar` | 1080×1080 | `instagram/perfil-1080.png` |
| `post-*` | 1080×1350 | `instagram/post-*.png` |
| `historia` | 1080×1920 | `instagram/historia-plantilla.png` |
| `full-de-marca` | 2400×1500 | `full-de-marca.png` |
