#!/usr/bin/env bash
# Renderitza el vídeo de presentació en català i castellà a renders/.
# Ús: brag-output/presentacio/render.sh [ca|es]   (sense argument, totes dues)
set -euo pipefail
cd "$(dirname "$0")"
ROOT=../..

# vendor/ i fonts/ no es versionen: es copien de l'app.
mkdir -p vendor fonts renders
cp "$ROOT"/node_modules/gsap/dist/gsap.min.js "$ROOT"/node_modules/three/build/three.module.js \
  "$ROOT"/node_modules/three/build/three.core.js "$ROOT"/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js vendor/
cp "$ROOT"/brand/fonts/*.woff2 fonts/
audio/make.sh >/dev/null

for lang in ${1:-ca es}; do
  npx --yes hyperframes@0.8.168 render . --quality delivery -f 30 \
    --variables "{\"lang\":\"$lang\"}" --output "renders/esco-presentacio-$lang.mp4"
done
ls -lh renders/*.mp4
