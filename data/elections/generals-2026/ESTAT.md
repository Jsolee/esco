# Eleccions generals del 29 de novembre de 2026: estat de les dades

Elecció real, convocada pel Real Decret 806/2026, de 5 d'octubre ([BOE núm. 248, de 6 d'octubre de 2026](https://www.boe.es/boe/dias/2026/10/06/pdfs/BOE-A-2026-20742.pdf)). **Oberta** (`"status": "open"`) des del 24/11/2026: candidatures proclamades al BOE i posicions confirmades amb els programes del 29-N. Del 17/10 al 24/11 va estar en mode brúixola; qui hi va jugar troba les respostes desades i, en tornar, veu «Ja pots obrir el teu vot».

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

## Candidatures (proclamades, BOE del 3/11/2026)

Font: [BOE-A-2026-23103](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23103). Una candidatura és el que surt a la papereta; les federacions del PSOE (PSE-EE, PSdeG, PSIB, PSN) i les marques territorials del Frente Amplio fora de Catalunya van dins de la candidatura principal.

| Fitxer | Candidatura | Circumscripcions |
|---|---|---|
| `pp.json` | Partido Popular | Totes menys Navarra |
| `upn-pp.json` | UPN en coalició amb el PP | Navarra (posicions i programa del PP) |
| `psoe.json` | PSOE | Totes menys Catalunya |
| `psc.json` | PSC-PSOE | Catalunya (programa del PSOE: el PSC no en publica de propi) |
| `vox.json` | Vox | Totes |
| `frente-amplio.json` | Frente Amplio (IU, Sumar, Más Madrid, CHA…) | 40, sense Terol, Ceuta, Melilla, la Comunitat Valenciana, Canàries ni Catalunya |
| `comuns-front-ampli.json` | Comuns-Front Ampli | Catalunya (posicions i programa del Frente Amplio) |
| `podemos.json` | Podemos | 41, sense Catalunya, Balears, Melilla, la Comunitat Valenciana (va dins de Compromís) ni Canàries (dins d'UPC) |
| `erc.json` | ERC | Catalunya |
| `junts.json` | Junts per Catalunya | Catalunya |
| `eh-bildu.json` | EH Bildu (a Navarra, EH Bildu-ERC) | País Basc i Navarra |
| `eaj-pnv.json` | EAJ-PNV | País Basc (a Navarra hi ha Geroa Bai, a part) |
| `bng.json` | BNG | Galícia |
| `compromis.json` | Compromís: Front Valencià (amb EUPV, Podem i ERPV) | Comunitat Valenciana |
| `cc.json` | Coalición Canaria (amb Municipalistas Primero Canarias) | Canàries |

**No incloses:** candidatures sense representació a la XV legislatura. Les enquestes de novembre donen opcions d'escó a Adelante Andalucía (unes 3 escons de mitjana) i a Unidad del Pueblo Canario (NC-BC, Podemos, IU i Sumar), però cap de les dues ha publicat un programa amb què codificar les posicions. Se Acabó La Fiesta es presenta a 46 circumscripcions i les enquestes li donen 0 escons.

## Afirmacions

`questions.json` té les 24 afirmacions d'aquesta campanya (esborrany del 17/10/2026): 3 per tema, amb context verificable i el sentit de l'acord equilibrat en cada eix. Les fonts, les votacions nominals del Congrés que serviran per codificar les posicions i el que falta verificar són a [`AFIRMACIONS.md`](./AFIRMACIONS.md). Abans d'obrir l'elecció, les han de revisar persones de sensibilitats diferents.

L'avançament electoral el va provocar la derogació dels dos decrets llei d'habitatge (RDL 26/2026 i 27/2026) el 2 d'octubre de 2026 ([Diari de Sessions núm. 210](https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-210.PDF)); el 5 d'octubre Sánchez va anunciar la convocatòria.

## Pressupost

El simulador de mandat necessita el cost de cada afirmació (`budget`, amb `budgetSource` d'una font neutral com l'AIReF) i les fonts de finançament (`funding` a `election.json`), amb la posició de cada candidatura sobre cada font. Cap de les 24 afirmacions té avui una estimació neutral citable, així que la primera versió s'obrirà **sense** simulador: sense fonts, el joc no demana finançament.

## Fets

1. Fase 1 (17/10): 24 afirmacions i 312 posicions a partir de votacions del Congrés, programes del 2023 i declaracions.
2. Fase 2 (24/11): candidatures proclamades al BOE del 3/11.
3. Fase 3 (24/11): posicions confirmades o corregides amb els programes del 29-N (vegeu `AFIRMACIONS.md`).

## Pendent

- Revisió humana de les cel·les marcades a `AFIRMACIONS.md` (fase 3).
- Enviar les posicions a cada partit perquè les pugui revisar.
- Després del 29-N: passar l'elecció a `archived` o deixar-la oberta com a consulta.
