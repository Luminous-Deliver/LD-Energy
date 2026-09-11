#!/usr/bin/env bash
# Verification only: isolated copy, existing adapter and lockfile, no deployment.
set -euo pipefail
task_source=/mnt/d/Dev/Abdul-2/OtherWorlds/LD-Energy/ld-energy-website
task_artifacts=${BOOKING_TEST_ARTIFACTS:-/mnt/d/Dev/Abdul-2/audits/website-growth-audit/ld-energy-stage1-2026-09-10}
task_node="$HOME/.cache/ld-energy-62463ca.DD7Qtb/node-v22.23.2-linux-x64/bin"
test -x "$task_node/node"
task_build=${BOOKING_BUILD_WORKSPACE:-$(mktemp -d "$HOME/.cache/ld-energy-stage1.XXXXXX")}
case "$task_build" in "$HOME"/.cache/ld-energy-stage1.*) ;; *) echo 'Unexpected build workspace'; exit 1;; esac
printf '%s\n' "$task_build" > "$task_artifacts/wsl-workspace.txt"
mkdir -p "$task_build/source"
tar -C "$task_source" --exclude=node_modules --exclude=.next --exclude=.vercel --exclude=.wrangler --exclude='.env*' --exclude='*.tsbuildinfo' -cf - . | tar -C "$task_build/source" -xf -
export PATH="$task_node:$PATH"
export NEXT_TELEMETRY_DISABLED=1 VERCEL_TELEMETRY_DISABLED=1 CI=1
unset NODE_OPTIONS
cd "$task_build/source"
if [ ! -d node_modules ]; then npm ci --no-audit --no-fund > "$task_artifacts/linux-install.log" 2>&1; fi
npm run typecheck > "$task_artifacts/typecheck.log" 2>&1
npm run lint > "$task_artifacts/lint.log" 2>&1
npm run build > "$task_artifacts/build.log" 2>&1
node --require ./tests/register.cjs --test tests/booking.test.cjs > "$task_artifacts/booking-tests.log" 2>&1
npm run pages:build > "$task_artifacts/pages-build.log" 2>&1
test -f .vercel/output/static/_worker.js/index.js
cp .vercel/output/config.json "$task_artifacts/vercel-output-config.json"
cp .vercel/output/static/_routes.json "$task_artifacts/shipped-routes.json"
printf 'STAGE 1 PRODUCTION AND PAGES BUILDS PASSED\n'
