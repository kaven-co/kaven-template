#!/usr/bin/env bash
# .agent/scripts/create-pr.sh
# Agent Core - PR Information Generator
# Version: 1.0.0
# Purpose: Generate PR information for manual creation (NO direct gh usage)

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "📋 Generating Pull Request Information..."
echo ""

# ==============================================================================
# 1. GET CURRENT BRANCH
# ==============================================================================

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Validate not on main
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
    echo -e "${RED}❌ Error: Cannot create PR from main/master branch${NC}"
    echo ""
    echo "Create a feature branch first:"
    echo "  git checkout -b feat/your-feature"
    exit 1
fi

# Validate branch name pattern
if ! echo "$CURRENT_BRANCH" | grep -qE "^(feat|fix|docs|chore|refactor|test)/"; then
    echo -e "${YELLOW}⚠️  Warning: Branch name doesn't follow convention${NC}"
    echo ""
    echo "Recommended pattern: <type>/<description>"
    echo "Types: feat, fix, docs, chore, refactor, test"
    echo ""
fi

echo "  Branch: $CURRENT_BRANCH"

# ==============================================================================
# 2. GENERATE PR TITLE
# ==============================================================================

TYPE=$(echo "$CURRENT_BRANCH" | cut -d'/' -f1)
NAME=$(echo "$CURRENT_BRANCH" | cut -d'/' -f2- | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

PR_TITLE="$TYPE: $NAME"

# ==============================================================================
# 3. GET COMMIT MESSAGES
# ==============================================================================

COMMITS=$(git log origin/main..HEAD --format="- %s" 2>/dev/null || git log HEAD~5..HEAD --format="- %s")

# ==============================================================================
# 4. GET DIFF STATS
# ==============================================================================

DIFF_STATS=$(git diff --stat origin/main..HEAD 2>/dev/null || git diff --stat HEAD~1..HEAD)
FILES_CHANGED=$(git diff --numstat origin/main..HEAD 2>/dev/null | wc -l || echo "?")

# ==============================================================================
# 5. FIND EVIDENCE BUNDLE
# ==============================================================================

EVIDENCE_INFO=""
if [[ -d ".agent/artifacts/evidence" ]]; then
    LATEST_EVIDENCE=$(ls -t .agent/artifacts/evidence/*.json 2>/dev/null | head -1 || echo "")
    if [[ -n "$LATEST_EVIDENCE" ]]; then
        EVIDENCE_INFO="Evidence bundle: $(basename "$LATEST_EVIDENCE")"
    fi
fi

# ==============================================================================
# 6. OUTPUT PR INFORMATION
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}📝 PR INFORMATION${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Title:${NC} $PR_TITLE"
echo ""
echo -e "${BLUE}Branch:${NC} $CURRENT_BRANCH → main"
echo ""
echo -e "${BLUE}Files changed:${NC} $FILES_CHANGED"
echo ""
echo -e "${BLUE}Commits:${NC}"
echo "$COMMITS"
echo ""
if [[ -n "$EVIDENCE_INFO" ]]; then
    echo -e "${BLUE}Evidence:${NC} $EVIDENCE_INFO"
    echo ""
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📋 SUGGESTED PR DESCRIPTION:${NC}"
echo ""
cat << DESCRIPTION
## 📝 Description

<!-- Describe your changes -->

## 🎯 Type of Change

- [$([[ "$TYPE" == "feat" ]] && echo "x" || echo " ")] feat: New feature
- [$([[ "$TYPE" == "fix" ]] && echo "x" || echo " ")] fix: Bug fix
- [$([[ "$TYPE" == "docs" ]] && echo "x" || echo " ")] docs: Documentation
- [$([[ "$TYPE" == "chore" ]] && echo "x" || echo " ")] chore: Maintenance
- [$([[ "$TYPE" == "refactor" ]] && echo "x" || echo " ")] refactor: Refactoring
- [$([[ "$TYPE" == "test" ]] && echo "x" || echo " ")] test: Tests

## 📋 Changes

$COMMITS

## 📊 Diff Stats

\`\`\`
$DIFF_STATS
\`\`\`

## ✅ Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commits are signed
DESCRIPTION
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}⚠️  MANUAL ACTION REQUIRED${NC}"
echo ""
echo "Create the PR manually at:"
echo "  https://github.com/YOUR_ORG/YOUR_REPO/compare/main...$CURRENT_BRANCH"
echo ""
echo "Or use GitHub CLI manually:"
echo "  gh pr create --title \"$PR_TITLE\" --body-file <(cat << 'BODY'"
echo "... paste description above ..."
echo "BODY"
echo ")"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0
