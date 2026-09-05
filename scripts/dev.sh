#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -n "${MIAODA_DEP_CACHE_DIR:-}" ] || [ -n "${SANDBOX_ID:-}" ]; then
  exec node "$SCRIPT_DIR/dev.js" "$@"
fi

exec node "$SCRIPT_DIR/dev-local.js" "$@"
