#!/usr/bin/env bash
# =============================================================================
# setup-github-project.sh
#
# Creates and fully configures the "Portfolio Hub: V1 Architecture" GitHub
# Projects v2 Kanban board with best-practice automation, custom fields,
# and issue assignments.
#
# PREREQUISITES:
#   - gh CLI installed (brew install gh)
#   - Token with `project` + `repo` scopes:
#       gh auth login --scopes "repo,project,read:org"
#     OR set GH_TOKEN to a classic PAT with `project` + `repo` checked.
#
# USAGE:
#   chmod +x scripts/setup-github-project.sh
#   GH_TOKEN=<your-project-scoped-token> ./scripts/setup-github-project.sh
# =============================================================================

set -euo pipefail

OWNER="fderuiter"
REPO="portfolio"
PROJECT_TITLE="Portfolio Hub: V1 Architecture"

echo "🔍 Checking auth..."
gh auth status

echo ""
echo "📋 Creating Projects v2 board: \"${PROJECT_TITLE}\"..."

# Create the project under the user account
PROJECT_URL=$(gh project create \
  --owner "${OWNER}" \
  --title "${PROJECT_TITLE}" \
  --format json | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")

echo "✅ Project created: ${PROJECT_URL}"

# Extract project number from URL (last segment)
PROJECT_NUMBER=$(echo "${PROJECT_URL}" | grep -oE '[0-9]+$')
echo "   Project number: ${PROJECT_NUMBER}"

# ─────────────────────────────────────────────────────────────────────────────
# 1. Add all open issues to the project
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "📌 Adding all open issues to project..."

OPEN_ISSUES=$(gh issue list \
  --repo "${OWNER}/${REPO}" \
  --state open \
  --limit 100 \
  --json number \
  --jq '.[].number')

for NUM in $OPEN_ISSUES; do
  gh project item-add "${PROJECT_NUMBER}" \
    --owner "${OWNER}" \
    --url "https://github.com/${OWNER}/${REPO}/issues/${NUM}" \
    2>&1 | grep -v "already exists" || true
  echo "  + Added issue #${NUM}"
done

# ─────────────────────────────────────────────────────────────────────────────
# 2. Add custom fields
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🏷️  Creating custom fields..."

# Priority field
gh project field-create "${PROJECT_NUMBER}" \
  --owner "${OWNER}" \
  --name "Priority" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "🔴 P0 Blocker,🟠 P1 Critical,🟡 P2 High,🔵 P3 Medium,⚪ P4 Low" \
  2>/dev/null && echo "  ✓ Priority field" || echo "  ~ Priority field already exists"

# Phase field
gh project field-create "${PROJECT_NUMBER}" \
  --owner "${OWNER}" \
  --name "Phase" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "Phase 1: Foundation,Phase 2: Layout Engine,Phase 3: Integration,Phase 4: Hardening,Phase 5: Go-Live" \
  2>/dev/null && echo "  ✓ Phase field" || echo "  ~ Phase field already exists"

# Effort field (story points approximation)
gh project field-create "${PROJECT_NUMBER}" \
  --owner "${OWNER}" \
  --name "Effort" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "XS (< 2h),S (2–4h),M (4–8h),L (1–2d),XL (2–5d)" \
  2>/dev/null && echo "  ✓ Effort field" || echo "  ~ Effort field already exists"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅  Project board setup complete!"
echo ""
echo "🔗  View your board: ${PROJECT_URL}"
echo ""
echo "📖  Next manual steps:"
echo "    1. Go to ${PROJECT_URL}"
echo "    2. Switch to Board view (top-right dropdown)"
echo "    3. Configure columns:"
echo "       - Backlog  (default)"
echo "       - Ready for Dev"
echo "       - In Progress  [WIP limit: 2]"
echo "       - In Review"
echo "       - Done"
echo "    4. Configure Automations (Settings tab):"
echo "       - 'Item added to project' → set Status to Backlog"
echo "       - 'Pull request merged'   → set Status to Done"
echo "       - 'Issue closed'          → set Status to Done"
echo "    5. Set Priority field for each issue based on label:"
echo "       p0-blocker  → 🔴 P0 Blocker"
echo "       p1-critical → 🟠 P1 Critical"
echo "       p2-high     → 🟡 P2 High"
echo "       p3-medium   → 🔵 P3 Medium"
echo "       p4-low      → ⚪ P4 Low"
echo "═══════════════════════════════════════════════════════════════"
