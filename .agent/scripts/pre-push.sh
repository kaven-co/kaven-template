#!/usr/bin/env bash
# .agent/scripts/pre-push.sh
# KAVEN AGENT CORE - Pre-Push Hook
# Version: 1.0.0
# Purpose: Validate before pushing to remote

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "🔒 Running pre-push checks..."
echo ""

# ==============================================================================
# 1. CHECK IF ON MAIN/STAGING (should never happen)
# ==============================================================================

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "staging" ]]; then
    echo -e "${RED}❌ Error: Cannot push directly to $CURRENT_BRANCH${NC}"
    echo ""
    echo "Protected branches must be updated via Pull Requests only."
    echo ""
    echo "Create a feature branch first:"
    echo "  git checkout -b feat/your-feature"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅${NC} Branch: $CURRENT_BRANCH (OK to push)"
echo ""

# ==============================================================================
# 2. CHECK IF BRANCH IS UP-TO-DATE WITH MAIN
# ==============================================================================

echo "🔄 Checking if branch is up-to-date with main..."

# Fetch latest from origin/main quietly
if ! git fetch origin main --quiet 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Could not fetch origin/main. Continuing anyway...${NC}"
else
    LOCAL=$(git rev-parse @ 2>/dev/null || echo "")
    REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "")
    BASE=$(git merge-base @ origin/main 2>/dev/null || echo "")
    
    if [[ -n "$LOCAL" ]] && [[ -n "$REMOTE" ]] && [[ -n "$BASE" ]]; then
        if [[ "$LOCAL" == "$REMOTE" ]]; then
            echo -e "${GREEN}✅${NC} Branch is up-to-date with main"
        elif [[ "$LOCAL" == "$BASE" ]]; then
            echo -e "${RED}❌ Error: Branch is behind origin/main${NC}"
            echo ""
            echo "Rebase first:"
            echo "  git fetch origin main"
            echo "  git rebase origin/main"
            echo ""
            exit 1
        elif [[ "$REMOTE" == "$BASE" ]]; then
            echo -e "${GREEN}✅${NC} Branch is ahead of main (ready to push)"
        else
            echo -e "${RED}❌ Error: Branch has diverged from main${NC}"
            echo ""
            echo "Rebase first:"
            echo "  git fetch origin main"
            echo "  git rebase origin/main"
            echo ""
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Could not compare with main. Continuing anyway...${NC}"
    fi
fi

echo ""

# ==============================================================================
# 3. VERIFY ALL COMMITS ARE SIGNED
# ==============================================================================

echo "🔐 Verifying commit signatures..."

# Get commits between origin/main and current HEAD
COMMITS=$(git log origin/main..HEAD --format="%H %G?" 2>/dev/null || git log HEAD~5..HEAD --format="%H %G?" 2>/dev/null || echo "")

if [[ -z "$COMMITS" ]]; then
    echo -e "${YELLOW}⚠️  No commits to check. Continuing...${NC}"
else
    UNSIGNED_COUNT=0
    
    while IFS= read -r line; do
        COMMIT=$(echo "$line" | awk '{print $1}')
        SIG=$(echo "$line" | awk '{print $2}')
        
        if [[ "$SIG" != "G" ]] && [[ "$SIG" != "U" ]]; then
            echo -e "${RED}  ❌ Unsigned commit: $COMMIT${NC}"
            UNSIGNED_COUNT=$((UNSIGNED_COUNT + 1))
        fi
    done <<< "$COMMITS"
    
    if [[ $UNSIGNED_COUNT -gt 0 ]]; then
        echo ""
        echo -e "${RED}❌ Error: Found $UNSIGNED_COUNT unsigned commit(s)${NC}"
        echo ""
        echo "All commits must be signed. To fix:"
        echo "  git rebase -i origin/main --exec 'git commit --amend --no-edit -S'"
        echo ""
        echo "Or configure automatic signing:"
        echo "  git config --local commit.gpgsign true"
        echo "  git config --local gpg.format ssh"
        echo "  git config --local user.signingkey ~/.ssh/id_ed25519.pub"
        echo ""
        exit 1
    else
        echo -e "${GREEN}✅${NC} All commits are signed"
    fi
fi

echo ""

# ==============================================================================
# 4. RUN FULL QUALITY GATES
# ==============================================================================

echo "🧪 Running full quality gates..."
echo ""

# Check if package.json exists
if [[ -f "package.json" ]]; then
    
    # Detect package manager
    if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
        PKG_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
    else
        echo -e "${YELLOW}⚠️  No package manager found. Skipping quality gates.${NC}"
        echo ""
        echo -e "${GREEN}✅ Pre-push checks passed (with warnings)${NC}"
        echo ""
        exit 0
    fi
    
    # Check if quality gates are defined
    HAS_LINT=$(grep -q '"lint"' package.json && echo "yes" || echo "no")
    HAS_TYPECHECK=$(grep -q '"typecheck"' package.json && echo "yes" || echo "no")
    HAS_TEST=$(grep -q '"test"' package.json && echo "yes" || echo "no")
    HAS_BUILD=$(grep -q '"build"' package.json && echo "yes" || echo "no")
    
    GATE_FAILED=0
    
    # Lint
    if [[ "$HAS_LINT" == "yes" ]]; then
        echo "  📋 Running lint..."
        if ! $PKG_MANAGER run lint 2>&1; then
            echo -e "${RED}  ❌ Lint failed${NC}"
            GATE_FAILED=1
        else
            echo -e "${GREEN}  ✅ Lint passed${NC}"
        fi
    fi
    
    # Typecheck
    if [[ "$HAS_TYPECHECK" == "yes" ]]; then
        echo "  🔍 Running typecheck..."
        if ! $PKG_MANAGER run typecheck 2>&1; then
            echo -e "${RED}  ❌ Typecheck failed${NC}"
            GATE_FAILED=1
        else
            echo -e "${GREEN}  ✅ Typecheck passed${NC}"
        fi
    fi
    
    # Tests
    if [[ "$HAS_TEST" == "yes" ]]; then
        echo "  🧪 Running tests..."
        if ! $PKG_MANAGER run test 2>&1; then
            echo -e "${RED}  ❌ Tests failed${NC}"
            GATE_FAILED=1
        else
            echo -e "${GREEN}  ✅ Tests passed${NC}"
        fi
    fi
    
    # Build
    if [[ "$HAS_BUILD" == "yes" ]]; then
        echo "  🏗️  Running build..."
        if ! $PKG_MANAGER run build 2>&1; then
            echo -e "${RED}  ❌ Build failed${NC}"
            GATE_FAILED=1
        else
            echo -e "${GREEN}  ✅ Build passed${NC}"
        fi
    fi
    
    if [[ $GATE_FAILED -eq 1 ]]; then
        echo ""
        echo -e "${RED}❌ Quality gates failed${NC}"
        echo ""
        echo "Fix the errors above before pushing."
        exit 1
    fi
fi

# ==============================================================================
# 5. SUCCESS
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Pre-push checks passed${NC}"
echo ""
echo -e "${BLUE}🚀 Pushing to origin/$CURRENT_BRANCH...${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0
