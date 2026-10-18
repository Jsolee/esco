# Escó: vídeo de presentació

Reel vertical de 1080×1920, a 30 fps i de 26 s, per penjar abans d'obrir el 29-N. Hi ha versió catalana i castellana a partir de la mateixa composició (variable `lang`). El fa servir el mateix hemicicle 3D que el Reel d'en Joan (`../composition`).

## Què millora respecte del Reel d'en Joan

- **El ganxo arriba abans:** «Tens un escó.» surt al primer segon, no a l'1,0. El primer segon és el que decideix si la gent continua mirant.
- **Ensenya el joc d'ara:** el vot Sí/No/Abstenció (un gest per carta), una línia vermella i «Així va votar el Congrés». No hi surt el pressupost, que el 29-N no té.
- **Les cartes són afirmacions reals** del 29-N, equilibrades. Cada carta que votes encén el seu bloc d'escons, com a l'app.
- **Es pot seguir sense so:** tot el que importa està escrit. Els sons fan de suport.
- **Respecta les zones segures de Reels:** cap text clau a dalt de tot (y < 220) ni a sota (y > 1500), on Instagram posa la interfície.
- **Hi ha la versió castellana,** perquè la bio és en castellà. Es renderitza amb `--variables '{"lang":"es"}'`.
- **Els sons són nostres:** sintetitzats amb ffmpeg (`audio/make.sh`), sense música de llicència dubtosa. La música es pot afegir des de la biblioteca d'Instagram en publicar.
- **No promet el que encara no hi és:** acaba amb «Molt aviat» i no ensenya cap partit ni cap rànquing amb noms.

## Neutralitat

- Es veuen 4 afirmacions: 2 que defensa més l'esquerra (jornada de 37,5 h, impost a les energètiques) i 2 que defensa més la dreta (desallotjament en 48 h, IRPF amb la inflació).
- El «tu» del vídeo vota de manera barrejada: sí, no, abstenció i sí. No té un perfil ideològic clar.
- La línia vermella cau en una proposta de la dreta i el Congrés va votar una moció de la dreta, que equilibra la jornada (esquerra) del post 03.
- Cap nom ni color de partit. Les barres del final no tenen noms.

## Guió

| # | Temps | Imatge | Text a pantalla (ca / es) | So |
|---|---|---|---|---|
| 1 | 0,0–2,4 | Fosc. El teu escó s'encén amb un esclat i una ona al terra. Etiqueta «El teu escó». | **Tens un escó.** / **Tienes un escaño.** · «29-N · Eleccions generals» | pop a 0,45 |
| 2 | 2,4–4,6 | La càmera s'allunya fins als 350 escons, que s'encenen des del centre. | ***Fes-lo servir.*** / ***Úsalo.*** | — |
| 3 | 4,6–10,4 | Tres cartes seguides, amb un gest cadascuna. La jornada de 37,5 h es llisca a la dreta (SÍ). L'impost a les energètiques, a l'esquerra (NO). El desallotjament en 48 h, amunt (ABSTENCIÓ). S'il·lumina el botó del gest, cau el segell i s'encén un bloc d'escons. | «24 propostes reals» · **Sí, no o abstenció.** | lliscada, cop al segell |
| 4 | 10,4–13,2 | La carta de l'IRPF. Un toc a «⊘ Línia vermella»: la carta es marca, cau el segell SÍ i el bloc s'encén més fort. | **3 línies vermelles.** ***Pesen el triple.*** | clic, cop |
| 5 | 13,2–16,4 | Puja un full: «Així va votar el Congrés · 13 nov. 2025». Les barres compten fins a 171 / 166 / 12. «El teu vot: Sí». | **Era una votació real.** · «Només el total. Sense partits.» | tics del recompte |
| 6 | 16,4–19,6 | Vista zenital, els escons parpellegen («Recompte») i s'encenen tots. Tres barres sense noms omplen el percentatge. | **Qui vota com tu?** / **¿Quién vota como tú?** | campana a 17,6 |
| 7 | 19,6–21,8 | Tipografia gran sobre l'hemicicle, una paraula per línia. | **Neutral. Privat. *Amb fonts.*** · «Res no surt del teu mòbil.» | cop suau |
| 8 | 21,8–26,0 | El símbol es munta escó a escó, «Escó», l'eslògan, la píndola `escon.app` i `@esconapp`. | «Molt aviat» · **Tens un escó. *Fes-lo servir.*** | campana al logo |

## Render

```bash
brag-output/presentacio/render.sh        # catalana i castellana a renders/
```

L'script recupera `vendor/` i `fonts/` (no es versionen), genera els sons i renderitza les dues versions.
