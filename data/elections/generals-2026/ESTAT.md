# Eleccions generals del 29 de novembre de 2026: estat de les dades

Elecció real, convocada pel Real Decret 806/2026, de 5 d'octubre ([BOE núm. 248, de 6 d'octubre de 2026](https://www.boe.es/boe/dias/2026/10/06/pdfs/BOE-A-2026-20742.pdf)). Des del 17/10 està en **mode brúixola** (`"status": "preview"`, `"reveal": "2026-11-03"`): es pot jugar i el resultat mostra només la posició als eixos; les respostes es desen al dispositiu. Per revelar les candidatures, canviar `status` a `open` quan les dades estiguin completes (i ajustar `reveal` si la data es mou).

## Calendari

| Data | Fita |
|---|---|
| 16 d'octubre | Últim dia per comunicar coalicions |
| 21–26 d'octubre | Presentació de candidatures |
| 28 d'octubre | BOE: candidatures presentades |
| 2 de novembre | Proclamació de candidatures (BOE el 3) |
| 13–27 de novembre | Campanya electoral |
| 29 de novembre | Votació |

Les dates de candidatures surten dels terminis de la LOREG comptats des del 6 d'octubre. Cal contrastar-les amb el [calendari oficial de la Junta Electoral Central](https://www.juntaelectoralcentral.es/cs/jec/eleccionesEnCurso/Elecciones_generales_2026).

## Candidatures (esquelet provisional)

> Segons la premsa, Podem no es presentarà a Catalunya: el 12/10/2026 va pactar donar-hi suport a ERC. Cal confirmar-ho amb les candidatures proclamades i, si és així, treure les províncies catalanes de `podemos.json`.

Criteri de l'esquelet: partits amb representació al Congrés a la XV legislatura que han anunciat que es presenten, segons la premsa i la [Viquipèdia](https://es.wikipedia.org/wiki/Elecciones_generales_de_Espa%C3%B1a_de_2026) a 16 d'octubre de 2026. **No és la llista oficial.** Totes porten `"provisional": true`, sense fonts ni posicions.

| Fitxer | Candidatura | Circumscripcions | Pendent de confirmar |
|---|---|---|---|
| `pp.json` | Partido Popular | Totes | Coalicions amb PAR (Aragó) i UPN (Navarra): nom a cada província |
| `psoe.json` | PSOE | Totes menys Catalunya | |
| `psc.json` | PSC | Catalunya | Nom oficial (PSC-PSOE?) |
| `vox.json` | Vox | Totes | |
| `frente-amplio.json` | Frente Amplio | Totes | Integrants i noms territorials (Comuns a Catalunya, Más Madrid…) |
| `podemos.json` | Podemos | Totes | Coalició amb Alianza Verde |
| `erc.json` | ERC | Catalunya | |
| `junts.json` | Junts per Catalunya | Catalunya | Integrants (DC, MEScat) |
| `eh-bildu.json` | EH Bildu | País Basc i Navarra | |
| `eaj-pnv.json` | EAJ-PNV | País Basc | Navarra (Geroa Bai?) |
| `bng.json` | BNG | Galícia | |
| `compromis.json` | Compromís | Comunitat Valenciana | Nom oficial (Compromís-Front Valencià?) |
| `cc.json` | Coalición Canaria | Canàries | |

Els colors són provisionals i només apareixen a la pantalla de resultats.

Altres formacions anunciades sense representació al Congrés (Se Acabó La Fiesta, PACMA, Democracia 21, Escaños en Blanco, Adelante Andalucía, Drago Canarias…): cal decidir el criteri per incloure-les quan es proclamin les candidatures.

## Afirmacions

`questions.json` té les 24 afirmacions d'aquesta campanya (esborrany del 17/10/2026): 3 per tema, amb context verificable i el sentit de l'acord equilibrat en cada eix. Les fonts, les votacions nominals del Congrés que serviran per codificar les posicions i el que falta verificar són a [`AFIRMACIONS.md`](./AFIRMACIONS.md). Abans d'obrir l'elecció, les han de revisar persones de sensibilitats diferents.

L'avançament electoral el va provocar la derogació dels dos decrets llei d'habitatge (RDL 26/2026 i 27/2026) el 2 d'octubre de 2026 ([Diari de Sessions núm. 210](https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-210.PDF)); el 5 d'octubre Sánchez va anunciar la convocatòria.

## Pressupost

El simulador de mandat necessita el cost de cada afirmació (`budget`, amb `budgetSource` d'una font neutral com l'AIReF) i les fonts de finançament (`funding` a `election.json`), amb la posició de cada candidatura sobre cada font. Cap de les 24 afirmacions té avui una estimació neutral citable, així que la primera versió s'obrirà **sense** simulador: sense fonts, el joc no demana finançament.

## Pla

Decidit el 17/10/2026:
1. **Fins al 26/10:** afirmacions i primera versió de les posicions (fet el 17/10: 312 posicions de 13 candidatures, a partir de votacions de la XV legislatura, programes del 2023 i declaracions; metodologia, matriu i cel·les dubtoses a `AFIRMACIONS.md`).
2. **3/11:** candidatures proclamades al BOE.
3. **Quan es publiquin els programes del 29-N:** confirmar o corregir cada posició amb el programa i la pàgina.
4. **Abans del 13/11:** revisió humana i obertura.

A finals d'octubre s'enviaran les 24 afirmacions a cada partit perquè hi respongui, com fan altres orientadors de vot; la seva resposta es publicarà al costat de la nostra codificació.

## Per poder obrir l'elecció

1. Substituir l'esquelet per les candidatures proclamades (BOE del 3 de novembre) i posar `"provisional": false`.
2. Afegir el programa de cada candidatura a `sources` i codificar-ne les posicions amb pàgina o URL (vegeu `DATA_GUIDE.md`).
3. Revisar les afirmacions.
4. Canviar `"status"` a `"open"`. A partir d'aquí, la validació exigeix que cada candidatura tingui fonts i una posició per a cada afirmació.

Hi ha una revisió programada el 3 de novembre de 2026 que farà el pas 1 en una branca local.
