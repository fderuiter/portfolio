#!/usr/bin/env bash
# Git Safety Guardrail Interceptor
# Intercepts and blocks destructive git operations across AI agent runners and CLI sessions.
# Bypass with: ALLOW_DANGEROUS_GIT=1 <command>

set -euo pipefail

# 1. Check for intentional bypass flag
if [ "${ALLOW_DANGEROUS_GIT:-0}" = "1" ]; then
  exit 0
fi

# 2. Capture command from arguments or stdin
COMMAND=""
if [ "$#" -gt 0 ]; then
  COMMAND="$*"
else
  # Read stdin if available
  if [ ! -t 0 ]; then
    INPUT=$(cat)
    # Check if input is a JSON payload from an agent tool runner (e.g. Claude Code or generic tool calls)
    if echo "$INPUT" | grep -q '"tool_input"'; then
      if command -v jq >/dev/null 2>&1; then
        COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)
      fi
      # Fallback to regex extraction if jq is unavailable or didn't match
      if [ -z "$COMMAND" ]; then
        COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed -E 's/"command"[[:space:]]*:[[:space:]]*"([^"]*)"/\1/' || true)
      fi
    else
      COMMAND="$INPUT"
    fi
  fi
fi

# If no command found, allow execution
if [ -z "$COMMAND" ]; then
  exit 0
fi

# 3. Define dangerous regex patterns
DANGEROUS_PATTERNS=(
  "git[[:space:]]+push.*[[:space:]](--force|-f)([[:space:]]|$)"
  "git[[:space:]]+push.*[[:space:]]([a-zA-Z0-9_-]+[[:space:]]+)?main([[:space:]]|$)"
  "git[[:space:]]+push.*:main([[:space:]]|$)"
  "git[[:space:]]+reset[[:space:]]+--hard"
  "git[[:space:]]+clean[[:space:]]+.*-f"
  "git[[:space:]]+branch[[:space:]]+.*-D"
  "git[[:space:]]+checkout[[:space:]]+(\.[[:space:]]*$|--[[:space:]]+\.)"
  "git[[:space:]]+restore[[:space:]]+(\.[[:space:]]*$|--staged[[:space:]]+\.)"
)

# 4. Check command against dangerous patterns
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: Destructive git operation intercepted: '$COMMAND'" >&2
    echo "Reason: Command matches safety guardrail pattern '$pattern'." >&2
    echo "To bypass intentionally, set ALLOW_DANGEROUS_GIT=1 before executing." >&2
    exit 2
  fi
done

exit 0
