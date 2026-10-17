# Generals 2026: afirmacions, fonts i votacions

Esborrany de les 24 afirmacions de `questions.json` (17/10/2026), per revisar abans de codificar les posicions. Per a cada afirmació hi ha:
- **Fonts del context:** documents que sostenen el text de la carta.
- **Votacions:** votacions nominals de la XV legislatura que serveixen de primera font per a les posicions (fase 1). Quan es publiquin els programes del 29-N, cada posició s'ha de confirmar o corregir amb el programa i la pàgina.
- **Repartiment previst:** qui hi estaria d'acord i qui no segons aquestes votacions. **No és una posició codificada**: una votació sobre una moció o un decret amb més mesures no equival a una posició sobre l'afirmació.

Criteris de les etiquetes:
- Frente Amplio = grup parlamentari Plurinacional SUMAR.
- Compromís = Àgueda Micó (Mixt des del 2025) i Alberto Ibáñez (SUMAR).
- Podem, BNG, CC i UPN = diputats del grup Mixt identificats pel nom.

Les votacions surten de les dades obertes del Congrés (`congreso.es/webpublica/opendata/votaciones`) o dels Diaris de Sessions. Quan la font és premsa, s'indica.

## Posicions (fase 1, 17/10/2026)

Les 13 candidatures provisionals tenen posició sobre les 24 afirmacions (312 cel·les): 290 amb valor i 22 «no s'hi pronuncia». Cap partit havia publicat encara el programa del 29-N.

**D'on surten:**
- **182: votacions nominals del Congrés.** Les 14 afirmacions que tenen votació a la XV legislatura (llistades més avall), per a les 13 candidatures. El vot de cada grup es calcula diputat per diputat a partir de les dades obertes del Congrés o de la llista de la votació per crida al Diari de Sessions.
- **7: altres votacions o intervencions al Parlament.** Senat, o legislatures anteriors, quan el programa no se'n pronuncia.
- **58: programes electorals del 2023.** Per a les altres 10 afirmacions.
- **43: lleis, iniciatives o declaracions públiques.** Quan el programa no se'n pronuncia.

**Valors:**
- **±1:** votar a favor o en contra d'una iniciativa, en el sentit de l'afirmació; o un programa que hi dona suport (o s'hi oposa) de manera general.
- **±2:** ser-ne l'autor (també el Govern amb els seus decrets i projectes), votar la llei o el decret que fa exactament el que diu l'afirmació, o un compromís explícit al programa.
- **0:** abstenció, o posició intermèdia explícita. Si els dos diputats de Compromís voten diferent, també 0.
- **Cas especial (`ter-amnistia`):** votar la llei d'amnistia compta −2 contra derogar-la, però votar-hi en contra només +1, perquè no és cap compromís de derogar-la.
- **Partits sense programa propi el 2023:**
  - PSC: s'hi aplica el del PSOE, amb el del PSC al Parlament (2024) per als temes catalans.
  - Podem: anava dins de Sumar. Se li apliquen documents propis (programa europeu 2024, esmenes, declaracions), mai el de Sumar.
  - Compromís: només té el programa conjunt amb Sumar, i així s'indica a cada cita.
- **CC:** el manifest de 2023 parla sobretot de Canàries; per això té 6 «no s'hi pronuncia».

Cada cita s'ha comprovat literalment contra el document i la pàgina indicats.

**Prova de coherència:** si es respon com un partit, els més propers surten com s'esperaria:
- PP–Vox 93, PSOE–PSC 97.
- Junts queda més a prop del PNB i de CC que de l'esquerra.
- El bloc d'esquerres (BNG, Compromís, Bildu, ERC, Podem, Frente Amplio) s'agrupa.

### Matriu

`·` = no s'hi pronuncia. Cada valor té la font i la cita al fitxer de la candidatura.

| Afirmació | PP | PSOE | PSC | Vox | FA | Pod. | ERC | Junts | Bildu | PNB | BNG | Comp. | CC |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `hab-renovacio` | -2 | +2 | +2 | -2 | +2 | +2 | +2 | -2 | +2 | -2 | +2 | +2 | -2 |
| `hab-desallotjament` | +2 | -1 | -1 | +1 | -1 | -1 | -1 | 0 | -1 | 0 | -1 | -1 | +1 |
| `hab-zones-tensionades` | +2 | -1 | -1 | +1 | -1 | -1 | -1 | +1 | -1 | 0 | -1 | -1 | 0 |
| `tre-jornada` | -2 | +2 | +2 | -2 | +2 | +1 | +1 | -2 | +1 | +1 | +1 | +1 | +1 |
| `tre-acomiadament` | -1 | +1 | +1 | -1 | +2 | +1 | +1 | 0 | +1 | +1 | +1 | +1 | +1 |
| `tre-smi-autonomic` | -2 | -1 | 0 | -2 | -1 | · | +2 | +2 | +2 | 0 | +1 | · | · |
| `fis-irpf-inflacio` | +2 | -1 | -1 | +1 | -1 | -1 | -1 | 0 | -1 | 0 | -1 | -1 | +1 |
| `fis-successions` | +2 | -1 | -1 | +2 | -2 | · | -1 | +1 | · | · | -1 | -2 | +1 |
| `fis-energetiques` | -1 | 0 | 0 | -1 | +1 | +2 | +1 | -1 | +1 | -1 | +1 | +1 | 0 |
| `ene-nuclear` | +2 | -1 | -1 | +1 | -1 | -1 | -1 | 0 | -1 | -1 | -1 | -1 | -1 |
| `ene-empresa-publica` | -1 | 0 | 0 | -1 | +1 | +2 | +1 | -1 | 0 | -1 | +1 | +1 | -1 |
| `ene-transvasaments` | 0 | -1 | -1 | +2 | -1 | -1 | -1 | -1 | -1 | -1 | -1 | -1 | -1 |
| `edu-concerts` | +1 | -1 | -1 | +1 | -2 | -1 | · | +1 | -1 | +1 | -2 | -1 | · |
| `edu-castella` | +1 | · | -1 | +1 | -1 | · | -2 | -2 | -1 | · | -2 | -1 | · |
| `edu-universitats-privades` | -1 | +2 | +2 | · | +1 | +2 | +1 | · | +1 | -1 | +1 | · | · |
| `san-gestio-publica` | -1 | +2 | +1 | -1 | +2 | +2 | 0 | -2 | +2 | · | +2 | +2 | · |
| `san-muface` | +2 | +1 | +1 | +2 | -2 | -1 | · | · | · | 0 | -1 | -1 | · |
| `san-avortament` | -2 | +2 | +2 | -2 | +2 | +1 | +1 | +1 | +1 | +1 | +1 | +1 | +1 |
| `ter-referendum` | -1 | -1 | -2 | -1 | 0 | +1 | +2 | +2 | +1 | +1 | +2 | +1 | -2 |
| `ter-immigracio` | -1 | +2 | +2 | -1 | +1 | -1 | +1 | +2 | +1 | +1 | +1 | 0 | +1 |
| `ter-amnistia` | +1 | -2 | -2 | +1 | -2 | -2 | -2 | -2 | -2 | -2 | -2 | -2 | +1 |
| `dre-regularitzacio` | -2 | +2 | +2 | -2 | +1 | +2 | +1 | -2 | +1 | +1 | +1 | +1 | +1 |
| `dre-multireincidencia` | +2 | +2 | +2 | +2 | -2 | -2 | 0 | +2 | -2 | +2 | -2 | -2 | 0 |
| `dre-memoria` | +2 | -2 | -2 | +2 | -2 | -1 | -2 | -1 | -2 | -2 | -1 | -1 | -1 |

### Cel·les per revisar

Són defensables però discutibles. Cal decidir-les en la revisió humana o amb els programes del 29-N:

**PP**
- **`dre-regularitzacio` (−2):** Feijóo rebutja la regularització del 2026, però el PP va votar a favor de tramitar la ILP el 2024.
- **`san-gestio-publica` (−1):** la font és de maig de 2024, d'abans del projecte de llei.

**PP i Vox**
- **`ter-referendum` (−1):** clarament en contra, però els textos no parlen d'un referèndum pactat. Si s'accepten declaracions explícites, seria −2.

**Vox**
- **`san-gestio-publica` (−1):** es dedueix de «reforzar los conciertos con la sanidad privada».

**PSOE / PSC**
- **`tre-smi-autonomic`:** només hi ha el vot contra la moció d'ERC al Senat, que barrejava altres temes. El PSC hi té 0 perquè proposa estudiar un salari mínim català de referència.
- **`san-muface` (+1):** la font és la renovació del concert 2025-2027.

**PSC**
- **`san-gestio-publica` (+1):** defensa el model català de concerts.

**Frente Amplio**
- **`edu-castella`:** només es coneix la posició dels Comuns (Llei 8/2022).
- **`tre-smi-autonomic`:** es basa en declaracions de Yolanda Díaz.

**Podem**
- **`san-muface` i `ter-referendum`:** fonts del 2021.
- **Circumscripcions:** segons la premsa, no es presentarà a Catalunya (pacte amb ERC del 12/10/2026). Cal confirmar-ho al BOE del 3/11 i ajustar les `circumscriptions`.

**Junts**
- **`dre-regularitzacio` (−2):** paràfrasi de 3Cat d'una entrevista a Nogueras (agost de 2026), contrària al programa del 2023.
- **`fis-successions` (+1):** bonificació del 99 %, no supressió.
- **`tre-smi-autonomic` (+2):** el programa ho condiciona a l'administració de tots els recursos fiscals.

**ERC**
- **`san-gestio-publica` (0):** suport condicionat a mantenir el model català.

**EH Bildu i PNB**
- **Diverses posicions:** s'han extrapolat del context basc (concerts, llengua, referèndum) o surten de fonts antigues (PNB: MUFACE 2021 i referèndum 2022).

**BNG**
- **`ter-referendum` (+2):** compromís general d'autodeterminació, sense nomenar Catalunya.
- **`edu-universitats-privades` (+1):** una sola notícia del 2026.

**Compromís**
- **`edu-castella` (−1):** la seva llei valenciana 4/2018 garanteix un 25 % en castellà.
- **`ter-referendum` (+1):** un sol vot del 2021.

**CC**
- **`fis-successions` (+1):** bonificació a Canàries, no supressió estatal.

## Equilibri

Si algú estigués d'acord amb totes les afirmacions, el punt del mapa quedaria a prop del centre:

| Eix | Afirmacions que empenyen cap al pol positiu | Cap al negatiu | Suma |
|---|---|---|---|
| Econòmic (− esquerra, + dreta) | 7 (+4,4) | 8 (−5,6) | −1,2 |
| Social (− liberal, + conservador) | 6 (+2,5) | 2 (−1,8) | +0,7 |
| Territorial (− Estat, + autogovern) | 3 (+2,7) | 6 (−3,2) | −0,5 |

Totes separen els partits, i diverses tallen els blocs: `ter-immigracio` (Podem amb PP i Vox), `dre-multireincidencia` (PSOE amb PP), `ene-empresa-publica` (PSOE s'absté), `tre-smi-autonomic` (PSOE amb PP).

El pressupost (`budget`) queda fora d'aquesta primera versió: cap afirmació té una estimació neutral de cost (AIReF o memòria econòmica) que es pugui citar.

---

## Habitatge

### `hab-renovacio`: indemnitzar si no es renova el lloguer
- **Fonts:**
  - [RDL 27/2026 (BOE)](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20822)
  - [DS 210, 2/10/2026](https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-210.PDF)
  - [RDL 28/2026](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20266)
- **Votació (2/10/2026):** convalidació del RDL 27/2026, en votació pública per crida: 166-184, derogat.
  - Sí: PSOE, Sumar, ERC, Bildu, Podem, BNG, Compromís.
  - No: PP, Vox, Junts, UPN, PNB, CC.
- **Avís:** el preàmbul del RDL 28/2026 data la derogació el 29/9; el Diari de Sessions diu el 2/10, que és la data correcta.

### `hab-desallotjament`: desallotjament en 24-48 hores
- **Fonts:**
  - [BOCG B-304-1 (PLO del PP)](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/B/BOCG-15-B-304-1.PDF)
  - [DS 185](https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-185.PDF)
- **Votacions:**
  - **19/5/2026, presa en consideració:** 171-164-11.
    - Sí: PP, Vox, UPN, CC.
    - Abstenció: Junts, PNB.
    - No: la resta (desglossament de la premsa, Demócrata).
  - **[10/9/2026, moció 173/000186, punt 1.c](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion196/20260910/Votacion009/VOT_20260910180629.pdf):** 171-44-131.
    - Sí: PP, Vox, UPN, CC.
    - No: Sumar, ERC, Bildu, Podem, BNG, Compromís.
    - Abstenció: PSOE, Junts, PNB.

### `hab-zones-tensionades`: suprimir els topalls de lloguer
- **Fonts:**
  - [Llei 12/2023](https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203)
  - [DS 179](https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-179.PDF)
  - [BOCG D-585](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-585.PDF)
- **Votacions:**
  - **21/4/2026, PL del PP 122/000253:** 178-163-6.
    - Sí: PP, Vox, Junts, UPN.
    - Abstenció: PNB, CC.
  - **[10/9/2026, moció per derogar la Llei 12/2023](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion196/20260910/Votacion007/VOT_20260910180628.pdf):** 170-168-8.
    - Sí: PP, Vox, UPN.
    - No: PSOE, Sumar, ERC, Bildu, PNB, Podem, BNG, Compromís.
    - Abstenció: Junts, CC.

## Treball

### `tre-jornada`: 37,5 hores
- **Fonts:**
  - [Estatut dels Treballadors](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430)
  - [BOCG A-58-3](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/A/BOCG-15-A-58-3.PDF)
- **Votacions:**
  - **[10/9/2025, esmenes a la totalitat al PL 121/000058](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion130/20250910/Votacion010/VOT_20250910213533.pdf):** 178-170.
    - Sí: PP, Vox, Junts, UPN.
    - No: PSOE, Sumar, ERC, Bildu, PNB, Podem, BNG, Compromís, CC.
  - **14/10/2025, 35 hores (BNG):** 162-178-6, sense desglossament verificat.

### `tre-acomiadament`: més indemnització per acomiadament improcedent
- **Fonts:**
  - [BOCG D-398](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-398.PDF)
  - [DS 136](https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-136.PDF)
  - Consell d'Europa, juny de 2026 (premsa: [swissinfo](https://www.swissinfo.ch/spa/el-consejo-de-europa-reitera-que-espa%C3%B1a-debe-legislar-la-indemnizaci%C3%B3n-por-despido/91603984))
- **Votació (17/9/2025):** PNL de Sumar, 171-170-6.
  - Sí: PSOE, Sumar, ERC, PNB, Bildu, BNG, Podem, CC, Compromís.
  - No: PP, Vox, UPN.
  - Abstenció: Junts.
  - El desglossament és de premsa ([Forbes](https://forbes.es/economia/799187/el-congreso-pide-al-gobierno-mejorar-el-despido-improcedente-por-el-error-al-votar-de-un-diputado-del-pp/)); un diputat del PP va votar sí per error.

### `tre-smi-autonomic`: salari mínim autonòmic
- **Fonts:**
  - [Senat, 13/5/2026 (premsa)](https://www.infobae.com/espana/agencias/2026/05/13/el-senado-rechaza-una-propuesta-de-erc-para-que-el-salario-minimo-lo-fijen-las-comunidades/)
  - [Llei de Junts al Parlament](https://www.aldia.cat/espanya/noticia-junts-registra-proposicio-llei-per-salari-minim-referencia-catala-1400-euros-20260219123326.html)
  - [Parlament Basc, ILP rebutjada](https://cronicavasca.elespanol.com/economia/20251113/parlamento-vasco-pnv-pse-iniciativa-popular-smi/1003742707010_0.html)
- **Votació (Senat, 13/5/2026):** moció d'ERC, 6-235-16.
  - Sí: ERC, Bildu.
  - No: PP, PSOE, Vox, UPN.
  - Abstenció: PNB, Junts, CC, BNG, Más Madrid.
  - La moció barrejava altres mesures.
- **Pendent:** la posició de BNG, Podem, CC i Compromís.

## Fiscalitat

### `fis-irpf-inflacio`: deflactar l'IRPF
- **Fonts:**
  - [Llei 35/2006](https://www.boe.es/eli/es/l/2006/11/28/35)
  - [BOCG D-435](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-435.PDF)
- **[Votació (13/11/2025)](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion146/20251113/Votacion062/VOT_20251113131334.json):** moció del PP, 171-166-12.
  - Sí: PP, Vox, CC, UPN.
  - Abstenció: Junts, PNB.
  - No: PSOE, Sumar, ERC, Bildu, Podem, BNG, Compromís.
  - La moció també incloïa 0-3 anys, habitatge i celíacs.
- **Cost:** no hi ha estimació oficial. Gestha (4.600-5.000 M€) i el PP (1.500 M€) no són fonts neutrals.

### `fis-successions`: suprimir successions i donacions
- **Fonts:**
  - [Llei 29/1987](https://www.boe.es/eli/es/l/1987/12/18/29)
  - [Banc d'Espanya, Butlletí 2025/T3](https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/InformesBoletinesRevistas/BoletinEconomico/25/T3/Fich/be2503-art01.pdf)
  - [STC 135/2025](https://hj.tribunalconstitucional.es/HJ/es/Resolucion/GetDocumentResolucion/31573)
  - [BOCG B-55-1 (Vox)](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/B/BOCG-15-B-55-1.PDF)
- **Votacions:** no n'hi ha cap d'aïllada.
  - PP: llei al Senat.
  - Vox: llei 122/000047.
  - Govern PSOE-Sumar: disconformitat pressupostària.
- **Cost (Govern, a la STC 135/2025):** 2.678 M€ de compensació a les CA i 125 M€ de la part no cedida.
- **Pendent:** la resta de partits.

### `fis-energetiques`: impost permanent a les energètiques
- **Fonts:**
  - [Llei 38/2022](https://www.boe.es/eli/es/l/2022/12/27/38)
  - [RDL 10/2024](https://www.boe.es/eli/es/rdl/2024/12/23/10)
  - [BOCG D-599](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-599.PDF)
- **Votacions:**
  - **[30/9/2026, moció de Podem, punt 1](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion202/20260930/Votacion003/VOT_20260930153552.json):** 44-181-122.
    - Sí: Sumar, ERC, Bildu, Podem, BNG, Compromís.
    - Abstenció: PSOE, CC.
    - No: PP, Vox, Junts, PNB.
  - **[22/1/2025, convalidació del gravamen temporal](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion089/20250122/Votacion002/VOT_20250122154427.json):** 165-183.
    - El PSOE hi va votar a favor.
    - Junts i el PNB hi van votar en contra.

## Energia i clima

### `ene-nuclear`: nuclears després del 2035
- **Fonts:**
  - [Pròrroga d'Almaraz (BOE)](https://www.boe.es/boe/dias/2026/08/14/pdfs/BOE-A-2026-17756.pdf)
  - [Notícia d'energias-renovables](https://www.energias-renovables.com/panorama/portazo-del-congreso-a-la-pretensi-n-20251113)
- **Votacions:**
  - **[17/6/2025, PL del PP](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion119/20250617/Votacion001/VOT_20250617203251.json):** 171-166-7.
    - Sí: PP, Vox, UPN.
    - Abstenció: Junts.
  - **[13/11/2025, esmena per suprimir el calendari](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion146/20251113/Votacion113/VOT_20251113131441.json):** 171-172-7, amb el mateix repartiment.
- **Avís:** que l'esmena fos sobre el calendari nuclear surt de la premsa; el JSON oficial només identifica la llei.

### `ene-empresa-publica`: empresa pública d'electricitat
- **Fonts:** [BOCG D-599](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-599.PDF)
- **[Votació (30/9/2026)](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion202/20260930/Votacion005/VOT_20260930153557.json):** moció de Podem, punt 3, 39-181-126.
  - Sí: Sumar, ERC, Podem, BNG, Compromís.
  - Abstenció: PSOE, Bildu.
  - No: PP, Vox, Junts, PNB, CC.

### `ene-transvasaments`: pla hidrològic amb transvasaments
- **Fonts:**
  - [Llei 11/2005](https://www.boe.es/eli/es/l/2005/06/22/11)
  - [RD 35/2023](https://www.boe.es/eli/es/rd/2023/01/24/35)
  - [BOCG D-134](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-134.PDF)
- **[Votació (23/4/2024)](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion036/20240423/Votacion026/VOT_20240423213536.json):** moció de Vox, punt 2, 32-174-135.
  - Sí: Vox.
  - Abstenció: PP.
  - No: la resta.
- **Avís:** el posicionament dels partits pot variar per territori (Múrcia i el País Valencià davant d'Aragó i Catalunya). Cal revisar-ho amb els programes.

## Educació

### `edu-concerts`: ampliar o renovar concerts
- **Fonts:**
  - [estadística del Ministeri d'Educació](https://www.libreria.educacion.gob.es/ebook/186407/free_download)
  - [LOMLOE](https://www.boe.es/eli/es/lo/2020/12/29/3)
  - [BOCG A-93-3 (esmenes)](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/A/BOCG-15-A-93-3.PDF)
- **Votacions:** no n'hi ha cap d'aïllada.
  - PP: programa 2023 i esmena 80.
  - Vox: programa 2023 (xec escolar).
  - Sumar: esmena 61 (no ampliar ni renovar concerts).
- **Pendent:** PSOE i la resta.

### `edu-castella`: 25 % en castellà
- **Fonts:**
  - [Llei catalana 8/2022](https://www.boe.es/eli/es-ct/l/2022/06/09/8)
  - [Ara: el TSJC i el decret](https://es.ara.cat/sociedad/educacion/tsjc-ordena-ejecutar-sentencia-recortaba-decreto-blindar-catalan-aulas_1_5693925.html)
  - [3Cat: Feijóo](https://www.3cat.cat/324/feijoo-amenaca-dimposar-el-castella-a-la-meitat-de-les-classes-a-catalunya/noticia/3361805/)
- **Votació (Parlament, 8/6/2022):** Llei 8/2022, 102-29-1, promoguda per PSC, ERC, Junts i Comuns.
- **Avís:** al Congrés no hi ha cap votació. Feijóo va parlar d'un 50 % (opinió personal, juliol de 2025).

### `edu-universitats-privades`: requisits per a universitats privades
- **Fonts:**
  - [RD 905/2025](https://www.boe.es/eli/es/rd/2025/10/07/905)
  - [CGPJ: el Suprem l'anul·la](https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Noticias-Judiciales/El-Tribunal-Supremo-anula-el-Real-Decreto-905-2025-de-universidades-por-falta-de-justificacion-para-su-tramitacion-urgente)
  - [eldiario.es: el PP el rebutja](https://www.eldiario.es/sociedad/pp-rechaza-decreto-anti-chiringuitos-universitarios-apoyan-rectores-sindicatos-estudiantes_1_12295535.html)
- **Votacions:** cap.
  - PSOE i Sumar: decret del Govern.
  - PP, Vox i PNB: s'hi oposen (consellers autonòmics, recursos).
- **Avís:** de la sentència del Suprem només hi ha la nota del CGPJ (8/10/2026), sense la data exacta.

## Sanitat

### `san-gestio-publica`: gestió privada només excepcional
- **Fonts:**
  - [BOCG A-95-1](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/A/BOCG-15-A-95-1.PDF)
  - [Nota del Ministeri de Sanitat](https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6906)
  - [Redacción Médica: el model català](https://www.redaccionmedica.com/politica/20260318/la-ley-de-gestion-publica-llegara-herida-al-congreso-por-el-modelo-catalan/260331_0.amp.html)
- **Votacions:** cap.
  - A favor: PSOE i Sumar (Govern).
  - En contra: PP i Junts (esmena a la totalitat anunciada); Vox (programa 2023).

### `san-muface`: model MUFACE
- **Fonts:**
  - [Concert 2025-2027](https://digital.gob.es/content/dam/portal-mtdfp/comunicacion/comunicacion_sefp/2025/04/2025-04-30-2/NPConciertoMUFACE.pdf)
  - [AIReF, Spending Review](https://www.airef.es/wp-content/uploads/2025/03/Spending_Review_2022-2026_Fase_1_Mutualismo_administrativo/Resumen-ejecutivo.pdf)
- **Votació (29/5/2024):** Comissió d'Hisenda, iniciativa del PP, 29-5-2, sense desglossament.
  - Sumar: PNL per integrar els mutualistes al SNS (desembre de 2024).
- **Pendent:** la posició programàtica del PSOE i de la resta.

### `san-avortament`: l'avortament a la Constitució
- **Fonts:**
  - [BOCG A-92-1](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/A/BOCG-15-A-92-1.PDF)
  - [BOCG A-92-2](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/A/BOCG-15-A-92-2.PDF)
  - [Nota de la Moncloa](https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/sanidad14/paginas/2025/011025-garcia-interrupcion-voluntaria-embarazo.aspx)
- **Votació (30/4/2026):** esmenes a la totalitat de PP i Vox, 171-177.
  - Sí: PP, Vox, UPN.
  - No: la resta.
- **Avís:** la resta de grups hi va votar en contra, però amb crítiques al plantejament:
  - Podem: diu que rebaixaria la protecció.
  - ERC, Junts, PNB i BNG: crítiques a la reforma.
  - No consta cap votació final.

## Model territorial

### `ter-referendum`: referèndum pactat a Catalunya
- **Fonts:**
  - [Maldita: l'acord PSOE-Junts](https://maldita.es/malditateexplica/20231110/referendum-acuerdo-junts-psoe-constitucion/)
  - [CEO, primera onada del 2026](https://documents.dadesobertes.gencat.cat/ceo/docs/REO1167_dossier_de_premsa.pdf)
- **Votacions:** cap al Congrés a la XV legislatura.
  - A favor: Junts i ERC.
  - En contra: PSOE.
- **Pendent:** PP, Vox i la resta, amb font. El rebuig de PP i Vox és previsible però no està documentat aquí.

### `ter-immigracio`: delegar la immigració a Catalunya
- **Fonts:**
  - [BOCG B-195-1](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/B/BOCG-15-B-195-1.PDF)
  - [DS 138](https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-138.PDF)
- **[Votació (23/9/2025)](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion133/20250923/Votacion001/VOT_20250923211048.json):** 173-177.
  - Sí: PSOE, Junts, ERC, Bildu, PNB, BNG, CC, Sumar (24 de 26), Micó.
  - No: PP, Vox, Podem, Ibáñez (Compromís), Pueyo (CHA), UPN.

### `ter-amnistia`: derogar l'amnistia
- **Fonts:**
  - [LO 1/2024](https://www.boe.es/buscar/doc.php?id=BOE-A-2024-11776)
  - [DS 45](https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-45.PDF)
  - [STC 137/2025](https://www.boe.es/buscar/doc.php?id=BOE-A-2025-15939)
  - [Nota del TC 91/2026](https://www.tribunalconstitucional.es/NotasDePrensaDocumentos/NP_2026_091/NOTA%20INFORMATIVA%20N%C2%BA%2091-2026.pdf)
- **Votació (30/5/2024):** aixecament del veto del Senat, 177-172.
  - Sí: PSOE, Sumar, ERC, Junts, Bildu, PNB, Podem, BNG.
  - No: PP, Vox, UPN, CC.
- **Avís:**
  - Votar en contra de la llei no equival a comprometre's a derogar-la. No s'ha trobat cap compromís actual del PP de derogar-la: el juny de 2026 Feijóo va parlar de «passar pàgina».
  - La conclusió del TJUE (16/7/2026, C-666/24) surt de resums de premsa; el comunicat de curia.europa.eu no es va poder obrir.

## Drets i llibertats

### `dre-regularitzacio`: regularitzacions extraordinàries
- **Fonts:**
  - [RD 316/2026](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-8284)
  - [Balanç de la Moncloa](https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/inclusion/Documents/2026/020726-balance-regularizacion-extraordinaria.pdf)
  - [PP: Feijóo](https://www.pp.es/actualidad/articulos/feijoo-critica-la-regularizacion-masiva-de-inmigrantes-del-gobierno-no-es-un-reparto-de-papeles-es-un-reparto-de-papeletas/)
- **Votacions:** no serveixen com a font.
  - La presa en consideració de la ILP (9/4/2024, 310-33) la va votar tothom menys Vox, també el PP.
  - Posicions del 2026: PSOE i Sumar (Govern) a favor; PP i Vox en contra.
- **Pendent:** la resta de partits. Podem (impulsor) i Junts (crític) només surten a la premsa.

### `dre-multireincidencia`: presó per furts reiterats
- **Fonts:** [LO 1/2026](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7966)
- **[Votació (12/2/2026)](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion159/20260212/Votacion023/VOT_20260212114343.json):** votació de conjunt, 302-36-8.
  - Sí: PP, Vox, PSOE, Junts, PNB, UPN.
  - No: Sumar, Bildu, Podem, BNG, Micó.
  - Abstenció: ERC, CC.

### `dre-memoria`: derogar la Llei de memòria democràtica
- **Fonts:**
  - [Llei 20/2022](https://www.boe.es/buscar/doc.php?id=BOE-A-2022-17099)
  - [que.es: compromís del PP](https://www.que.es/2026/07/14/feijoo-derogar-ley-memoria-democratica-primer-consejo/)
  - [Ara: lleis autonòmiques](https://es.ara.cat/politica/guerra-pp-vox-leyes-memoria-division-interna_1_5536739.html)
- **Votacions:** cap sobre la llei estatal.
  - A favor de derogar-la: PP (compromís del juliol de 2026) i Vox (acords autonòmics).
  - En contra: el PSOE (el Govern va recórrer les derogacions autonòmiques).
- **Pendent:** la resta de partits.

---

## Descartades (per si cal canviar-ne alguna)

Hi ha alternatives investigades, amb votació oficial:
- **Habitatge:** suspensió de desnonaments; IVA del 4 % per al primer habitatge (vot transversal).
- **Treball:** altes per les mútues; cobrar menys durant la baixa.
- **Fiscalitat:**
  - condonació del deute autonòmic;
  - que la Generalitat recapti tots els impostos;
  - impost de solidaritat de les grans fortunes (fonts febles).
- **Energia:** preus màxims de llum i carburants.
- **Educació:**
  - PAU única;
  - ràtios estatals (només PNB i Junts en contra).
- **Sanitat:**
  - derogar l'eutanàsia (Vox contra tots);
  - sanitat per a migrants en situació irregular.
- **Territori:** repartiment de menors migrants; llengües cooficials al Congrés.
- **Drets:**
  - elecció dels vocals del CGPJ pels jutges;
  - reforma de la Llei de seguretat ciutadana.

Les fonts i votacions de les descartades no s'han copiat aquí; si se'n recupera alguna, cal tornar a verificar-les.
