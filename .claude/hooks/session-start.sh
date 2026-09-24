#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs dependencies and generates the Prisma client so a fresh cloud
# container can run `npm test`, `npm run quality` and the git hooks.
# See docs/how-to/set-up-claude-cloud-sessions.md.
set -euo pipefail

# Local sessions manage their own node_modules.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

# `npm ci` only when node_modules is missing or stale against the lockfile,
# so resumed sessions skip the reinstall. `npm ci` never rewrites
# package-lock.json, which keeps the docs-drift and lockfile checks clean.
# postinstall runs `prisma generate`; prepare installs the husky git hooks.
if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npx prisma generate
fi

# Tests must never reach a real database or provider. lib/env.ts skips
# .env files under Vitest, and the container has no production secrets.
# Playwright uses the preinstalled Chromium (PLAYWRIGHT_BROWSERS_PATH is
# set by the container), so nothing is downloaded here.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo 'export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1'
    echo 'export NEXT_TELEMETRY_DISABLED=1'
  } >> "$CLAUDE_ENV_FILE"
fi
