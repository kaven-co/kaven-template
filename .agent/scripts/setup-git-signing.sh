#!/bin/bash
set -e

# =============================================================================
# Agent Core - Git Signing Setup Script
# =============================================================================
# Automates the setup of SSH-based commit signing for Git
# Compatible with: Bash, Zsh, macOS, Linux
# Version: 1.0.0
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
}

# =============================================================================
# STEP 1: Check Prerequisites
# =============================================================================

info "Checking prerequisites..."

# Check Git version
GIT_VERSION=$(git --version | grep -oP '\d+\.\d+' | head -1)
if (( $(echo "$GIT_VERSION < 2.34" | bc -l) )); then
  error "Git 2.34+ required. Current: $GIT_VERSION"
  exit 1
fi
success "Git $GIT_VERSION detected"

# Check if in Git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  error "Not in a Git repository"
  exit 1
fi
success "Git repository detected"

# Check for SSH key
SSH_KEY=""
if [ -f ~/.ssh/id_ed25519.pub ]; then
  SSH_KEY=~/.ssh/id_ed25519.pub
elif [ -f ~/.ssh/id_rsa.pub ]; then
  SSH_KEY=~/.ssh/id_rsa.pub
else
  error "No SSH key found"
  echo ""
  echo "Generate one with:"
  echo "  ssh-keygen -t ed25519 -C 'your_email@example.com'"
  exit 1
fi
success "SSH key found: $SSH_KEY"

# Check Git user config
GIT_NAME=$(git config user.name 2>/dev/null || echo "")
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "")

if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
  error "Git user not configured"
  echo ""
  echo "Configure with:"
  echo "  git config --global user.name 'Your Name'"
  echo "  git config --global user.email 'your_email@example.com'"
  exit 1
fi
success "Git user: $GIT_NAME <$GIT_EMAIL>"

# =============================================================================
# STEP 2: Configure Git Signing
# =============================================================================

echo ""
info "Configuring Git signing..."

git config --local commit.gpgsign true
success "Enabled commit signing"

git config --local gpg.format ssh
success "Set GPG format to SSH"

git config --local user.signingkey "$SSH_KEY"
success "Set signing key to $SSH_KEY"

# =============================================================================
# STEP 3: Create allowed_signers File
# =============================================================================

echo ""
info "Creating allowed_signers file..."

ALLOWED_SIGNERS=~/.ssh/allowed_signers

# Backup existing file if present
if [ -f "$ALLOWED_SIGNERS" ]; then
  warning "Existing allowed_signers found, backing up..."
  cp "$ALLOWED_SIGNERS" "${ALLOWED_SIGNERS}.backup.$(date +%Y%m%d_%H%M%S)"
  success "Backup created"
fi

# Create new allowed_signers
echo "$GIT_EMAIL $(cat $SSH_KEY)" > "$ALLOWED_SIGNERS"
success "Created $ALLOWED_SIGNERS"

# Configure Git to use it
git config --local gpg.ssh.allowedSignersFile "$ALLOWED_SIGNERS"
success "Configured Git to use allowed_signers"

# =============================================================================
# STEP 4: Verify Setup
# =============================================================================

echo ""
info "Verifying setup..."

# Check all configs
GPGSIGN=$(git config --local commit.gpgsign)
GPG_FORMAT=$(git config --local gpg.format)
SIGNING_KEY=$(git config --local user.signingkey)
ALLOWED_FILE=$(git config --local gpg.ssh.allowedSignersFile)

if [ "$GPGSIGN" != "true" ] || [ "$GPG_FORMAT" != "ssh" ] || [ -z "$SIGNING_KEY" ] || [ -z "$ALLOWED_FILE" ]; then
  error "Configuration incomplete"
  exit 1
fi
success "All configurations verified"

# =============================================================================
# STEP 5: Test Signing (Optional)
# =============================================================================

echo ""
info "Testing commit signing..."

# Create temporary test file
TEST_FILE=".git/signing-test-$$"
echo "Test" > "$TEST_FILE"
git add "$TEST_FILE"

# Attempt test commit
if git commit -S -m "test: verify signing" --quiet 2>/dev/null; then
  # Check signature
  if git log --show-signature -1 2>&1 | grep -q "Good"; then
    success "Commit signing works correctly!"
    
    # Show signature details
    echo ""
    info "Signature details:"
    git log --show-signature -1 --format="%h %s" | head -3
  else
    warning "Commit created but signature verification failed"
    echo ""
    echo "This might be OK if you're testing."
    echo "Run: git log --show-signature -1"
  fi
  
  # Clean up test commit
  git reset --soft HEAD~1 > /dev/null 2>&1
  git restore --staged "$TEST_FILE" > /dev/null 2>&1
  rm -f "$TEST_FILE"
else
  error "Test commit failed"
  rm -f "$TEST_FILE"
  exit 1
fi

# =============================================================================
# STEP 6: Summary & Next Steps
# =============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Git signing setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📋 Configuration Summary:"
echo ""
echo "  Commit Signing: ✅ Enabled"
echo "  GPG Format:     SSH"
echo "  Signing Key:    $SSH_KEY"
echo "  Allowed Sigs:   $ALLOWED_SIGNERS"
echo ""

echo "🎯 Next Steps:"
echo ""
echo "  1. Verify bootstrap:"
echo "     pnpm run bootstrap"
echo ""
echo "  2. Test quality gates:"
echo "     pnpm run quality"
echo ""
echo "  3. Start coding:"
echo "     git checkout -b feat/your-feature"
echo ""

echo "📚 Documentation:"
echo "  - Full setup guide: .agent/docs/DEV_SETUP.md"
echo "  - Troubleshooting:  .agent/docs/TROUBLESHOOTING.md"
echo ""

# Optional: Level 2 recommendation
if [ -n "$(ssh-keygen -y -f ${SSH_KEY%.pub} -P '' 2>&1 | grep 'passphrase')" ]; then
  echo "💡 Tip: Your SSH key has a password."
  echo "   Consider Level 2 setup for better experience:"
  echo "   See: .agent/docs/DEV_SETUP.md#level-2-recommended-setup"
  echo ""
fi

success "Setup complete! Happy coding! 🚀"
echo ""
