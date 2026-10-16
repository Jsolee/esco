# Eleccions generals del 29 de novembre de 2026: estat de les dades

Elecció real, convocada pel Real Decret 806/2026, de 5 d'octubre ([BOE núm. 248, de 6 d'octubre de 2026](https://www.boe.es/boe/dias/2026/10/06/pdfs/BOE-A-2026-20742.pdf)). A l'app surt com a **propera** (`"status": "upcoming"`) i no es pot jugar fins que les dades estiguin completes.

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

`questions.json` és una còpia de les 24 afirmacions d'exemple. Cal revisar-les per a aquesta campanya (per exemple, els decrets d'habitatge que van provocar l'avançament electoral) i fer-les validar per persones de sensibilitats diferents.

## Per poder obrir l'elecció

1. Substituir l'esquelet per les candidatures proclamades (BOE del 3 de novembre) i posar `"provisional": false`.
2. Afegir el programa de cada candidatura a `sources` i codificar-ne les posicions amb pàgina o URL (vegeu `DATA_GUIDE.md`).
3. Revisar les afirmacions.
4. Canviar `"status"` a `"open"`. A partir d'aquí, la validació exigeix que cada candidatura tingui fonts i una posició per a cada afirmació.

Hi ha una revisió programada el 3 de novembre de 2026 que farà el pas 1 en una branca local.
