#!/usr/bin/env bash
# .agent/scripts/install-hooks.sh
# KAVEN AGENT CORE - Git Hooks Installation
# Version: 1.0.0
# Purpose: Install pre-commit and pre-push hooks

set -euo pipefail

HOOKS_DIR=".git/hooks"
AGENT_HOOKS_DIR=".agent/scripts"

echo "📌 Installing git hooks..."

# Check if .git directory exists
if [[ ! -d ".git" ]]; then
    echo "❌ Error: .git directory not found. Are you in a git repository?"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# ==============================================================================
# INSTALL PRE-COMMIT HOOK
# ==============================================================================

if [[ -f "$AGENT_HOOKS_DIR/pre-commit.sh" ]]; then
    # Create symlink to pre-commit script
    ln -sf "../../$AGENT_HOOKS_DIR/pre-commit.sh" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✅ Pre-commit hook installed"
else
    echo "⚠️  Warning: pre-commit.sh not found in $AGENT_HOOKS_DIR"
fi

# ==============================================================================
# INSTALL PRE-PUSH HOOK
# ==============================================================================

if [[ -f "$AGENT_HOOKS_DIR/pre-push.sh" ]]; then
    # Create symlink to pre-push script
    ln -sf "../../$AGENT_HOOKS_DIR/pre-push.sh" "$HOOKS_DIR/pre-push"
    chmod +x "$HOOKS_DIR/pre-push"
    echo "✅ Pre-push hook installed"
else
    echo "⚠️  Warning: pre-push.sh not found in $AGENT_HOOKS_DIR"
fi

# ==============================================================================
# VERIFY INSTALLATION
# ==============================================================================

echo ""
echo "🔍 Verifying installation..."

if [[ -L "$HOOKS_DIR/pre-commit" ]]; then
    echo "✅ pre-commit: $(readlink $HOOKS_DIR/pre-commit)"
else
    echo "❌ pre-commit: NOT installed"
fi

if [[ -L "$HOOKS_DIR/pre-push" ]]; then
    echo "✅ pre-push: $(readlink $HOOKS_DIR/pre-push)"
else
    echo "❌ pre-push: NOT installed"
fi

echo ""
echo "✅ Git hooks installation complete"
