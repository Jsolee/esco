# Escó: Reel de presentació

**Format:** vertical 1080×1920, 30 fps, 24 s. Copy in Catalan.
**Tone:** polished/cinematic editorial: dark chamber, big serif type, one light that is you.

## Rubric

- **What it is:** a game in which you get a seat in the Congress, vote 24 proposals by swiping cards, fund every costly yes, and see which candidacies vote like you.
- **Who it's for:** voters, above all young ones, who would never fill in a questionnaire.
- **What sets it apart:**
  - It is a mandate simulator. Money is limited, so a yes that costs money has to come out of a cut, a tax or debt.
  - Neutral, private (everything is computed on the phone), and every position has a source.
- **Sharpest claim:** "Cada sí té un preu." Even a tax cut has a cost.
- **Visual hook:** a single seat lights up in a dark hemicycle of 350.
- **Real UI:**
  - The vote card with its "Costa" pill and the 5 vote pads.
  - The "D'on surten els diners?" sheet.
  - The influence tokens.
  - The overhead count of the 3D chamber.
- **Share line:** "Tens un escó. Fes-lo servir."

## Neutrality

- No party names or colors.
- The proposal shown is the inheritance-tax one (tax cut, right-coded). It balances post 02 (public housing, left-coded) and shows that lowering taxes also costs money.
- The funding sheet shows one option of each kind.
- The ranking appears with names hidden.
- Nothing claims that the 29-N election can already be played.

## Storyboard

| # | Time | Scene | Text to read | Audio |
|---|---|---|---|---|
| 1 | 0.0–3.3 | Close-up in the dark: the center seat lights up with a pop and a ripple on the floor; "EL TEU ESCÓ" label | **Tens un escó.** | Quiet music intro; soft impact at 0.7 |
| 2 | 3.3–5.7 | The camera pulls back to the full hemicycle; seats come on from the centre out | **Fes-lo servir.** (under line 1) | — |
| 3 | 5.7–9.5 | The chamber dims and a card is dealt: "Les herències entre pares i fills haurien d'estar exemptes d'impostos" (Costa 6). Drag right; the "D'acord" pad is pressed; the D'ACORD stamp hits on the drop at 8.74; the card flies off; a wedge of seats pulses | **Llisca i vota 24 propostes.** | card-slide at the deal and the fling; impact at the stamp |
| 4 | 9.5–12.9 | The funding sheet comes up: "D'on surten els diners?", "Costa 6 punts. Te'n falten 6." Taps on Pujar l'IVA (+3) and Endeutar-se (+3); coins fly into the bar; "Finançada" | title + subtitle | card-slide; chip-lay on each coin, quiet |
| 5 | 12.9–14.9 | Full-screen type over the chamber | **Cada sí / *té un preu.*** | soft impact at 13.11 |
| 6 | 14.9–17.5 | Tokens: "Reparteix la teva influència", a pool of 10, 2×2 topic tiles; 5 tokens fly in and the tiles turn chalk with "pes ×2" | title | chip-lay, quiet |
| 7 | 17.5–20.4 | Overhead "Recompte" with flicker; seats light up in fill order; at 18.56 "Qui vota com tu?" appears; bars with hidden names count up | **Qui vota com tu?** | bell at 18.56 |
| 8 | 20.4–24.0 | Logo lockup, "Tens un escó. Fes-lo servir.", URL pill, "Neutral · Privat · Amb fonts" | logo + URL | bell at 20.75; music fades out 23–24 |

## Music cue guidance

Track: `happy-beats-business-moves-vol-12` (109.96 BPM).

- The intro is quiet until about 8.5 s, then there is a step up at 8.74 (the stamp), and the full level arrives around 19 s (the reveal).
- Strong cues used: 8.74, 13.11, 18.56, 20.75 and 22.37.
- The license is from ende.app and has to be checked before publishing.

## Poster

A settled frame from scene 2: the full hemicycle with "Tens un escó. / Fes-lo servir."

## Re-render

`vendor/`, `fonts/` and `audio/` are not committed. Before rendering again, restore them:

```bash
cd brag-output/composition && mkdir -p vendor fonts audio
cp ../../node_modules/gsap/dist/gsap.min.js ../../node_modules/three/build/three.module.js ../../node_modules/three/build/three.core.js ../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js vendor/
cp ../../brand/fonts/*.woff2 fonts/
B=~/.claude/skills/brag/assets; cp $B/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3 audio/music.mp3
for f in impact/impactSoft_medium_001 impact/impactSoft_heavy_003 impact/impactSoft_medium_004 casino/card-slide-1 casino/card-slide-3 casino/chip-lay-1 casino/chip-lay-2 casino/chip-lay-3 impact/impactBell_heavy_000 impact/impactBell_heavy_003; do cp $B/sfx/$f.ogg audio/; done
npx hyperframes@0.8.168 check && npx hyperframes@0.8.168 render --quality delivery -f 30 --output ../work/render.mp4
```

Then extract the poster (`-ss 5.1`) into `brag.jpg` and bake it in as frame 0 of `brag.mp4` with an ffmpeg overlay `enable='eq(n,0)'`.
