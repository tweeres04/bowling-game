#!/bin/sh
# Screenshots /og-scene into the share image. Run after `npm run build`.
set -e
PORT=3997
npx next start -p $PORT >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER; rm -rf "$PROFILE"' EXIT
until curl -s -o /dev/null "http://localhost:$PORT/og-scene"; do sleep 0.5; done

# SwiftShader gives headless Chrome WebGL; the time budget lets the 3D scene
# load and draw before the screenshot
# A throwaway profile, so it never touches your real Chrome
PROFILE=$(mktemp -d)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --user-data-dir="$PROFILE" --hide-scrollbars \
  --window-size=1200,630 \
  --force-device-scale-factor=1 --use-angle=swiftshader \
  --enable-unsafe-swiftshader --virtual-time-budget=6000 \
  --screenshot="$PWD/src/app/opengraph-image.png" \
  "http://localhost:$PORT/og-scene"
echo "Saved src/app/opengraph-image.png"
