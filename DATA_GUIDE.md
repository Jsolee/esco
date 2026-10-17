# Guia de dades d'Escó

Totes les dades són fitxers JSON dins de `data/`, versionats amb el codi i validats amb Zod (`lib/schema.ts`) i amb comprovacions creuades (`lib/data.ts`). Si alguna dada és incorrecta, `npm test` i `npm run build` fallen i diuen el fitxer i el camp.

> L'elecció inclosa, `generals-2027-ficticia`, és **fictícia**: partits, posicions i fonts són inventats. Serveix de plantilla.

```
data/
├── index.ts                 registre: aquí s'importa cada elecció
├── territory.json           19 comunitats + 52 províncies (codis INE)
├── topics.json              temes (habitatge, treball…)
└── elections/<id-eleccio>/
    ├── election.json
    ├── questions.json
    └── candidacies/<id-candidatura>.json   una per candidatura, amb posicions i fonts
```

Tots els identificadors (`id`) són en minúscules, sense accents ni espais: `[a-z0-9-]`.

## 1. Afegir una elecció

1. Crea la carpeta `data/elections/<id>/`, per exemple `autonomiques-catalunya-2028`.
2. Escriu `election.json`:

```json
{
  "id": "autonomiques-catalunya-2028",
  "type": "autonomica",
  "scope": { "community": "09" },
  "date": "2028-02-13",
  "status": "upcoming",
  "name": { "ca": "Eleccions al Parlament de Catalunya 2028", "es": "Elecciones al Parlament de Catalunya 2028" },
  "fictional": false,
  "axes": ["economic", "social", "territorial"],
  "facts": [{ "ca": "…", "es": "…" }]
}
```

| Camp | Valors |
|---|---|
| `type` | `general`, `autonomica`, `europea`, `municipal` |
| `scope` | `"ES"` per a tot l'Estat, o `{ "community": "<codi INE de la comunitat>" }` |
| `status` | `open` (es pot jugar), `upcoming` (surt a la portada com a propera, sense enllaç al joc), `archived` (no es mostra) |
| `fictional` | `true` mostra l'avís «Dades fictícies» a totes les pantalles |
| `axes` | eixos del mapa; mínim dos |
| `facts` | dades curioses i verificables per a les pauses del joc (es fan servir les tres primeres) |
| `funding` | fonts de finançament del simulador de mandat (vegeu més avall). Sense fonts, el joc no demana d'on surten els diners |

### Fonts de finançament (`funding`)

Quan algú vota a favor d'una proposta que costa diners i no té marge, ha de triar d'on els treu. Cada font és com una afirmació oculta: fer-la servir equival a estar-hi d'acord, i les candidatures hi tenen posició (amb font, igual que a les afirmacions).

```json
{
  "id": "imp-irpf",
  "kind": "tax",
  "topic": "fiscalitat",
  "capacity": 6,
  "name": { "ca": "Pujar l'IRPF a les rendes altes", "es": "Subir el IRPF a las rentas altas" },
  "detail": { "ca": "Més impost sobre la renda per a qui més guanya.", "es": "Más impuesto sobre la renta para quien más gana." },
  "axes": { "economic": -0.8 }
}
```

| Camp | Valors |
|---|---|
| `kind` | `cut` (retallar un àmbit), `tax` (pujar un impost) o `debt` (endeutar-se) |
| `capacity` | punts màxims que se'n poden treure en tot el mandat |
| `topic` | tema al qual sumen les fitxes d'influència |
| `axes` | com en les afirmacions: cap a on empeny fer-la servir |

Ofereix sempre opcions de tots els tipus i de sensibilitats diferents (retallades de despesa social i no social, impostos progressius i indirectes, deute), perquè el finançament no empenyi cap a una resposta.

3. Registra-la a `data/index.ts`: importa `election.json`, `questions.json` i cada candidatura, i afegeix l'objecte a la llista `elections` de `RAW`.

## 2. Afegir afirmacions (`questions.json`)

```json
{
  "id": "hab-lloguer",
  "topic": "habitatge",
  "text": {
    "ca": "Els lloguers a les zones tensionades haurien de tenir un preu màxim fixat per llei.",
    "es": "Los alquileres en las zonas tensionadas deberían tener un precio máximo fijado por ley."
  },
  "context": { "ca": "…", "es": "…" },
  "axes": { "economic": -1 },
  "budget": -12,
  "budgetSource": "https://www.airef.es/…"
}
```

- **`budget`** (opcional): efecte sobre el pressupost si s'hi està d'acord, en punts. Negatiu si costa diners (més despesa o menys impostos), positiu si n'aporta. Les propostes que no tenen cost públic (una regulació, un referèndum) no en porten.
- **`budgetSource`**: d'on surt l'estimació del cost. És obligatori en eleccions reals obertes; fes servir fonts neutrals (AIReF, pressupostos, memòries econòmiques dels programes). Recorda que baixar impostos també té cost.
- **`text`**: una afirmació clara, en positiu, que es pugui respondre d'acord o en desacord. Màxim 120 caràcters per idioma, perquè hi càpiga a la carta del mòbil.
- **`context`**: 2 o 3 frases neutres amb la situació actual i els arguments principals de cada banda. Res que no es pugui verificar.
- **`topic`**: un `id` de `data/topics.json`. Els usuaris poden marcar temes com a prioritaris (pes ×2).
- **`axes`**: quant empeny cap a cada pol estar-hi **d'acord**, de −1 a +1.
  - `economic`: −1 esquerra, +1 dreta
  - `social`: −1 liberal, +1 conservador
  - `territorial`: −1 més competències a l'Estat, +1 més autogovern
  - Una afirmació pot no contribuir a cap eix (`{}`): compta per a l'afinitat però no mou el mapa.

Bones pràctiques per a la neutralitat:

- Alterna afirmacions formulades des de posicions diferents, de manera que «d'acord» no vulgui dir sempre el mateix bàndol.
- Evita adjectius valoratius («injust», «necessari») i el llenguatge propi d'un partit.
- Fes revisar cada afirmació per persones amb sensibilitats polítiques diferents.

## 3. Afegir candidatures (`candidacies/<id>.json`)

```json
{
  "id": "partit-a",
  "name": "Partit A",
  "short": "PA",
  "color": "#E07A5F",
  "members": ["Partit B", "Partit E"],
  "circumscriptions": "all",
  "sources": [
    {
      "id": "programa",
      "title": "Programa electoral 2027",
      "url": "https://example.org/programa-2027.pdf",
      "date": "2027-05-15",
      "lang": "es"
    }
  ],
  "positions": {
    "hab-lloguer": { "value": 2, "source": "programa", "page": 34, "quote": "Limitaremos por ley el precio…" },
    "ene-nuclear": { "value": null, "source": "programa" }
  }
}
```

- **Una candidatura és el que surt a la papereta.** Si una coalició canvia segons el territori, crea una candidatura per a cada variant i limita-la amb `circumscriptions`.
- **`circumscriptions`**: `"all"` o una llista de codis de província (`["08", "17", "25", "43"]`). A una mateixa província no hi pot haver dues candidatures amb el mateix nom.
- **`color`**: només apareix a la pantalla de resultats, sempre acompanyat del nom.
- **`members`** (opcional): partits que formen la coalició.
- **`provisional`** (opcional, `false` per defecte): `true` mentre la candidatura no s'hagi proclamat oficialment. Una elecció `upcoming` pot tenir candidatures provisionals sense fonts ni posicions (`"sources": []`, `"positions": {}`) per anar preparant les dades. Una elecció `open` no: hi exigeix candidatures oficials, almenys una font i una posició per a cada afirmació. Vegeu `data/elections/generals-2026/ESTAT.md` com a exemple.
- **`sources`**: tots els documents d'on surten les posicions. `lang` és l'idioma del document; serveix per marcar correctament les cites.

### Posicions

Cada candidatura ha de tenir **una entrada per a cada afirmació i per a cada font de finançament** de l'elecció. Si en falta alguna, el build falla: així queda clar que s'ha revisat tot.

| `value` | Significat |
|---|---|
| `2` | Molt d'acord |
| `1` | D'acord |
| `0` | Neutral o posició intermèdia explícita |
| `-1` | En desacord |
| `-2` | Molt en desacord |
| `null` | Revisat: el document no s'hi pronuncia |

- Una posició amb valor necessita `page` (pàgina del document) o `url` (si la font és una declaració, una web, etc.).
- `source` ha de ser un `id` de `sources`.
- `quote` és opcional però molt recomanable: el text literal, en l'idioma original, que justifica el valor.
- `null` no és «no ho sabem»: vol dir que el programa s'ha llegit i no en diu res. Aquella afirmació no comptarà per a la candidatura, i si una candidatura es pronuncia sobre menys del 50 % de les afirmacions que ha votat una persona, surt fora del rànquing, en una llista a part.

Recomanació de procés: que dues persones assignin els valors per separat i que es discuteixin les discrepàncies. Si es pot, envia les posicions a cada partit perquè les pugui revisar abans de publicar.

## 4. Validar

```bash
npm test        # valida totes les dades i prova l'algorisme
npm run build   # torna a validar i genera les pàgines
```

Errors típics:

- `falta la posició sobre «x» (escriu null si no s'hi pronuncia)`
- `Cada posició amb valor necessita pàgina o URL`
- `«x» cita una font inexistent «y»`
- `«x» fa servir l'eix «territorial», que l'elecció no declara`
- `el nom «x» ja existeix a la circumscripció 08`

## 5. Territori

`data/territory.json` conté les 19 comunitats i ciutats autònomes i les 52 províncies amb el codi INE. Les dues primeres xifres d'un codi postal són el codi de la província, així que la ubicació per codi postal no necessita cap llista addicional.

La cerca per nom busca províncies, capitals i alguns municipis grans (camp `aliases`). Per afegir-hi tots els municipis, cal la «Relación de municipios y sus códigos» de l'INE convertida a JSON. Serà imprescindible per a les municipals i per a les autonòmiques amb circumscripcions insulars (Illes Balears, Canàries), on la província no n'hi ha prou.

## 6. Treure el mode fictici

Quan una elecció tingui dades reals, posa `"fictional": false` a `election.json`. Desapareixen els avisos de dades fictícies d'aquella elecció.

## 7. Idiomes

Català i castellà són obligatoris a totes les dades (`{ "ca": "…", "es": "…" }`). Per afegir euskera o gallec:

1. Afegeix el codi a `LOCALES` a `lib/schema.ts`.
2. Crea `messages/eu.json` (o `gl.json`) i registra'l a `lib/i18n.ts`.
3. Afegeix `eu` als textos de les dades. Mentre no hi sigui, es mostra el castellà.
