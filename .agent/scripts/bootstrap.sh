#!/usr/bin/env bash
# .agent/scripts/bootstrap.sh
# Agent Core - Bootstrap Script
# Version: 1.0.0
# Purpose: Initial setup for Agent Core

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🚀 Bootstrapping Agent Core..."
echo ""

# Get project name
PROJECT_NAME=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
echo "  Project: $PROJECT_NAME"
echo ""

# ==============================================================================
# 1. INSTALL GIT HOOKS
# ==============================================================================

echo "📌 Installing git hooks..."
if [[ -f ".agent/scripts/install-hooks.sh" ]]; then
    bash .agent/scripts/install-hooks.sh
    echo -e "${GREEN}✅ Git hooks installed${NC}"
else
    echo -e "${RED}❌ Error: install-hooks.sh not found${NC}"
    exit 1
fi

# ==============================================================================
# 2. VERIFY GIT SIGNING SETUP
# ==============================================================================

echo ""
echo "🔐 Checking Git signing configuration..."

GPGSIGN=$(git config --local commit.gpgsign 2>/dev/null || echo "")
GPG_FORMAT=$(git config --local gpg.format 2>/dev/null || echo "")
SIGNING_KEY=$(git config --local user.signingkey 2>/dev/null || echo "")
ALLOWED_SIGNERS=$(git config --local gpg.ssh.allowedSignersFile 2>/dev/null || echo "")

if [ "$GPGSIGN" = "true" ] && [ "$GPG_FORMAT" = "ssh" ] && [ -n "$SIGNING_KEY" ] && [ -f "$ALLOWED_SIGNERS" ]; then
    echo -e "${GREEN}✅ Git signing already configured${NC}"
else
    echo -e "${YELLOW}⚠️  Git signing not fully configured${NC}"
    echo ""
    echo "📚 To complete setup, run one of:"
    echo ""
    echo "  Option 1 (Automatic):"
    echo "    ./.agent/scripts/setup-git-signing.sh"
    echo ""
    echo "  Option 2 (Manual):"
    echo "    See: .agent/docs/DEV_SETUP.md"
    echo ""
    echo "⚠️  Commits will not be signed until this is completed!"
    echo ""
fi

# ==============================================================================
# 3. INSTALL DEPENDENCIES (if package.json exists)
# ==============================================================================

if [[ -f "package.json" ]]; then
    echo ""
    echo "📦 Installing node dependencies..."
    
    if command -v pnpm &> /dev/null; then
        pnpm install
        echo -e "${GREEN}✅ Dependencies installed (pnpm)${NC}"
    elif command -v npm &> /dev/null; then
        npm install
        echo -e "${GREEN}✅ Dependencies installed (npm)${NC}"
    else
        echo -e "${YELLOW}⚠️  No package manager found (pnpm/npm). Skipping dependency installation.${NC}"
    fi
fi

# ==============================================================================
# 4. CONFIGURE GIT SIGNING
# ==============================================================================

echo ""
echo "🔒 Configuring commit signing..."

# Check if already configured
CURRENT_GPG_FORMAT=$(git config --get gpg.format || echo "")
CURRENT_SIGNING_KEY=$(git config --get user.signingkey || echo "")

if [[ "$CURRENT_GPG_FORMAT" == "ssh" ]] && [[ -n "$CURRENT_SIGNING_KEY" ]]; then
    echo -e "${GREEN}✅ Commit signing already configured${NC}"
    echo "   Format: ssh"
    echo "   Key: $CURRENT_SIGNING_KEY"
else
    echo "   Configuring SSH signing..."
    
    # Configure git for SSH signing
    git config --local gpg.format ssh
    git config --local commit.gpgsign true
    git config --local tag.gpgsign true
    
    # Try to find SSH key
    if [[ -f ~/.ssh/id_ed25519.pub ]]; then
        git config --local user.signingkey ~/.ssh/id_ed25519.pub
        echo -e "${GREEN}✅ SSH signing configured${NC}"
        echo "   Key: ~/.ssh/id_ed25519.pub"
    elif [[ -f ~/.ssh/id_rsa.pub ]]; then
        git config --local user.signingkey ~/.ssh/id_rsa.pub
        echo -e "${GREEN}✅ SSH signing configured${NC}"
        echo "   Key: ~/.ssh/id_rsa.pub"
    else
        echo -e "${YELLOW}⚠️  SSH key not found. Generate one with:${NC}"
        echo "      ssh-keygen -t ed25519 -C 'your_email@example.com'"
        echo ""
        echo "   Then add it to GitHub as a 'Signing Key'"
        echo "   After that, run this bootstrap script again."
    fi
fi

# ==============================================================================
# 5. CREATE ARTIFACTS DIRECTORIES
# ==============================================================================

echo ""
echo "📂 Creating artifact directories..."

mkdir -p .agent/artifacts/evidence
mkdir -p .agent/artifacts/reports
mkdir -p .agent/artifacts/logs

echo -e "${GREEN}✅ Directories created${NC}"

# ==============================================================================
# 6. INITIALIZE TELEMETRY (Per-Project)
# ==============================================================================

echo ""
echo "📊 Initializing telemetry..."

TELEMETRY_DIR="$HOME/.agent-core/$PROJECT_NAME"
mkdir -p "$TELEMETRY_DIR"
touch "$TELEMETRY_DIR/telemetry.log"

# Check if telemetry is disabled
if [[ "${AGENT_CORE_TELEMETRY:-1}" == "0" ]]; then
    echo -e "${YELLOW}⚠️  Telemetry disabled (AGENT_CORE_TELEMETRY=0)${NC}"
else
    echo -e "${GREEN}✅ Telemetry initialized${NC}"
    echo "   Log: $TELEMETRY_DIR/telemetry.log"
    echo "   Disable with: export AGENT_CORE_TELEMETRY=0"
fi

# Emit bootstrap event
if [[ -f ".agent/scripts/telemetry.sh" ]]; then
    source .agent/scripts/telemetry.sh
    emit_event "system.bootstrap" "true" "0" "{\"project\": \"$PROJECT_NAME\"}"
fi

# ==============================================================================
# 7. VERIFY SETUP
# ==============================================================================

echo ""
echo "🔍 Verifying setup..."

ERRORS=0

# Check git signing
if [[ "$(git config --get gpg.format)" == "ssh" ]]; then
    echo -e "${GREEN}✅${NC} Git signing configured"
else
    echo -e "${RED}❌${NC} Git signing NOT configured"
    ERRORS=$((ERRORS + 1))
fi

# Check hooks installed
if [[ -f ".git/hooks/pre-commit" ]]; then
    echo -e "${GREEN}✅${NC} Pre-commit hook installed"
else
    echo -e "${RED}❌${NC} Pre-commit hook NOT installed"
    ERRORS=$((ERRORS + 1))
fi

if [[ -f ".git/hooks/pre-push" ]]; then
    echo -e "${GREEN}✅${NC} Pre-push hook installed"
else
    echo -e "${RED}❌${NC} Pre-push hook NOT installed"
    ERRORS=$((ERRORS + 1))
fi

# Check directories
if [[ -d ".agent/artifacts/evidence" ]]; then
    echo -e "${GREEN}✅${NC} Evidence directory created"
else
    echo -e "${RED}❌${NC} Evidence directory NOT created"
    ERRORS=$((ERRORS + 1))
fi

# Check telemetry
if [[ -f "$TELEMETRY_DIR/telemetry.log" ]]; then
    echo -e "${GREEN}✅${NC} Telemetry initialized at $TELEMETRY_DIR"
else
    echo -e "${RED}❌${NC} Telemetry NOT initialized"
    ERRORS=$((ERRORS + 1))
fi

# ==============================================================================
# 8. FINAL MESSAGE
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ Agent Core bootstrapped successfully!${NC}"
    echo ""
    echo "Project: $PROJECT_NAME"
    echo "Telemetry: $TELEMETRY_DIR/telemetry.log"
    echo ""
    echo "Next steps:"
    echo "  1. Verify commit signing: git config --get user.signingkey"
    echo "  2. Run quality gates: ./.agent/scripts/quality-gate.sh"
    echo "  3. Start development!"
else
    echo -e "${RED}❌ Bootstrap completed with $ERRORS error(s)${NC}"
    echo ""
    echo "Please fix the errors above and run bootstrap again:"
    echo "  ./.agent/scripts/bootstrap.sh"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
