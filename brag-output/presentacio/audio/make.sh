#!/usr/bin/env bash
# Sons del vídeo, sintetitzats amb ffmpeg: no depenen de cap llicència de tercers.
set -euo pipefail
cd "$(dirname "$0")"
gen() { ffmpeg -loglevel error -y -f lavfi -i "aevalsrc=$1:s=48000:d=$2" -ac 2 -af "$3" "$4"; }
# pop: s'encén un escó (to que baixa ràpid)
gen "0.55*sin(2*PI*(480+520*exp(-t*28))*t)*exp(-t*16)" 0.4 "afade=t=in:d=0.004" pop.wav
# stamp: cop sord del segell (greu + una mica de soroll)
gen "0.9*sin(2*PI*(52+110*exp(-t*30))*t)*exp(-t*10)+0.18*(random(0)*2-1)*exp(-t*70)" 0.6 "lowpass=f=2400,afade=t=in:d=0.002" stamp.wav
# tick: clic curt (botó i recompte)
gen "0.5*sin(2*PI*1750*t)*exp(-t*110)+0.2*sin(2*PI*3500*t)*exp(-t*160)" 0.08 "afade=t=in:d=0.001" tick.wav
# bell: campana suau (revelació i logo)
gen "0.3*(sin(2*PI*660*t)+0.55*sin(2*PI*990*t)+0.25*sin(2*PI*1485*t))*exp(-t*2.4)" 2.4 "afade=t=in:d=0.005,afade=t=out:st=2.0:d=0.4" bell.wav
# whoosh: carta que entra o surt (soroll rosa filtrat amb una envolupant)
ffmpeg -loglevel error -y -f lavfi -i "anoisesrc=d=0.42:c=pink:a=0.6:r=48000" -ac 2 \
  -af "highpass=f=500,lowpass=f=3200,afade=t=in:d=0.16:curve=qsin,afade=t=out:st=0.16:d=0.26:curve=qsin,volume=2.2" whoosh.wav
ls *.wav
