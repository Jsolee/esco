#!/usr/bin/env bash
# Regenera els PNG del kit de marca a partir de source/kit.html amb Chrome sense interfície.
# Ús: brand/export.sh            (totes les peces)
#     brand/export.sh historia   (només les que coincideixin amb el filtre)
set -euo pipefail
cd "$(dirname "$0")"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PORT="${PORT:-3007}"

# id del .board | amplada | alçada | fitxer
BOARDS="
symbol-dark|1024|1024|logo/esco-symbol-on-dark.png
symbol-light|1024|1024|logo/esco-symbol-on-light.png
lockup-dark|2400|900|logo/esco-lockup-on-dark.png
lockup-light|2400|900|logo/esco-lockup-on-light.png
stacked-dark|1600|1600|logo/esco-stacked-on-dark.png
avatar|1080|1080|instagram/perfil-1080.png
hl-com-es-juga|1080|1920|instagram/destacat-com-es-juga.png
hl-linies-vermelles|1080|1920|instagram/destacat-linies-vermelles.png
hl-metodologia|1080|1920|instagram/destacat-metodologia.png
hl-privacitat|1080|1920|instagram/destacat-privacitat.png
hl-novetats|1080|1920|instagram/destacat-novetats.png
post-llancament|1080|1350|instagram/post-01-llancament.png
post-linies-vermelles|1080|1350|instagram/post-02-linies-vermelles.png
post-proposta|1080|1350|instagram/post-03-plantilla-proposta.png
post-sabies|1080|1350|instagram/post-04-plantilla-sabies-que.png
post-com-es-juga|1080|1350|instagram/post-05-com-es-juga.png
historia|1080|1920|instagram/historia-plantilla.png
full-de-marca|2400|1500|full-de-marca.png
"

python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER' EXIT
sleep 1

echo "$BOARDS" | while IFS='|' read -r id w h out; do
  [ -z "$id" ] && continue
  case "$id" in *"${1:-}"*) ;; *) continue ;; esac
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$w,$h" --virtual-time-budget=4000 --screenshot="$PWD/$out" \
    "http://127.0.0.1:$PORT/source/kit.html#$id" >/dev/null 2>&1
  echo "$out"
done
