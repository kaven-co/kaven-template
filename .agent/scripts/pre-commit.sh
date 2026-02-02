#!/usr/bin/env bash
# .agent/scripts/pre-commit.sh
# Agent Core - Pre-Commit Hook
# Version: 1.0.0
# Purpose: Run quality gates before commit

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "🔒 Running pre-commit checks..."
echo ""

# ==============================================================================
# 1. CHECK GIT USER CONFIGURED
# ==============================================================================

if ! git var GIT_COMMITTER_IDENT > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Git user not configured${NC}"
    echo ""
    echo "Configure with:"
    echo "  git config --local user.name 'Your Name'"
    echo "  git config --local user.email 'your@email.com'"
    exit 1
fi

# ==============================================================================
# 2. CHECK SSH SIGNING CONFIGURED
# ==============================================================================

GPG_FORMAT=$(git config --get gpg.format || echo "")

if [[ "$GPG_FORMAT" != "ssh" ]]; then
    echo -e "${YELLOW}⚠️  Warning: SSH signing not configured. Configuring now...${NC}"
    
    git config --local gpg.format ssh
    git config --local commit.gpgsign true
    
    if [[ -f ~/.ssh/id_ed25519.pub ]]; then
        git config --local user.signingkey ~/.ssh/id_ed25519.pub
        echo -e "${GREEN}✅ SSH signing configured (id_ed25519)${NC}"
    elif [[ -f ~/.ssh/id_rsa.pub ]]; then
        git config --local user.signingkey ~/.ssh/id_rsa.pub
        echo -e "${GREEN}✅ SSH signing configured (id_rsa)${NC}"
    else
        echo -e "${RED}❌ Error: No SSH key found${NC}"
        echo ""
        echo "Generate one with:"
        echo "  ssh-keygen -t ed25519 -C 'your_email@example.com'"
        echo ""
        echo "Then add it to GitHub as a 'Signing Key'"
        exit 1
    fi
fi

# ==============================================================================
# 3. VERIFY SIGNING KEY EXISTS
# ==============================================================================

SIGNING_KEY=$(git config --get user.signingkey || echo "")

if [[ -z "$SIGNING_KEY" ]]; then
    echo -e "${RED}❌ Error: No signing key configured${NC}"
    exit 1
fi

# Expand ~ to home directory
SIGNING_KEY="${SIGNING_KEY/#\~/$HOME}"

if [[ ! -f "$SIGNING_KEY" ]]; then
    echo -e "${RED}❌ Error: Signing key not found at $SIGNING_KEY${NC}"
    echo ""
    echo "Generate one with:"
    echo "  ssh-keygen -t ed25519 -C 'your_email@example.com'"
    exit 1
fi

# ==============================================================================
# 4. RUN QUALITY GATES
# ==============================================================================

echo "🧪 Running quality gates..."
echo ""

# Check if package.json exists (Node.js project)
if [[ -f "package.json" ]]; then
    
    # Detect package manager
    if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
        PKG_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
    else
        echo -e "${YELLOW}⚠️  No package manager found. Skipping quality gates.${NC}"
        exit 0
    fi
    
    # Check if quality gates are defined in package.json
    HAS_LINT=$(grep -q '"lint"' package.json && echo "yes" || echo "no")
    HAS_TYPECHECK=$(grep -q '"typecheck"' package.json && echo "yes" || echo "no")
    HAS_TEST=$(grep -q '"test"' package.json && echo "yes" || echo "no")
    
    # Run lint
    if [[ "$HAS_LINT" == "yes" ]]; then
        echo "  📋 Running lint..."
        if ! $PKG_MANAGER run lint; then
            echo -e "${RED}❌ Lint failed${NC}"
            exit 1
        fi
        echo -e "${GREEN}  ✅ Lint passed${NC}"
    else
        echo -e "${YELLOW}  ⚠️  No lint script found, skipping${NC}"
    fi
    
    echo ""
    
    # Run typecheck
    if [[ "$HAS_TYPECHECK" == "yes" ]]; then
        echo "  🔍 Running typecheck..."
        if ! $PKG_MANAGER run typecheck; then
            echo -e "${RED}❌ Typecheck failed${NC}"
            exit 1
        fi
        echo -e "${GREEN}  ✅ Typecheck passed${NC}"
    else
        echo -e "${YELLOW}  ⚠️  No typecheck script found, skipping${NC}"
    fi
    
    echo ""
    
    # Run tests
    if [[ "$HAS_TEST" == "yes" ]]; then
        echo "  🧪 Running tests..."
        if ! $PKG_MANAGER run test; then
            echo -e "${RED}❌ Tests failed${NC}"
            exit 1
        fi
        echo -e "${GREEN}  ✅ Tests passed${NC}"
    else
        echo -e "${YELLOW}  ⚠️  No test script found, skipping${NC}"
    fi
    
else
    echo -e "${YELLOW}⚠️  No package.json found. Skipping quality gates.${NC}"
fi

# ==============================================================================
# 5. SUCCESS
# ==============================================================================

echo ""
echo -e "${GREEN}✅ Pre-commit checks passed${NC}"
echo ""

exit 0
