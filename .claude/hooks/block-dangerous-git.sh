#!/usr/bin/env bash
# Claude Code PreToolUse Hook Compatibility Wrapper
# Delegates to project root git safety guardrail script.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ -f "$ROOT_DIR/scripts/git-guardrail.sh" ]; then
  exec "$ROOT_DIR/scripts/git-guardrail.sh" "$@"
fi

exit 0
