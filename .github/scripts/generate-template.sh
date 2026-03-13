#!/usr/bin/env bash
# .github/scripts/generate-template.sh
#
# Syncs kaven-framework to kaven-co/kaven-template.
#
# HOW TO SET UP THE REQUIRED SECRET:
# 1. Create a Personal Access Token (PAT) at https://github.com/settings/tokens/new
#    - Select "Fine-grained tokens" (recommended) or classic token
#    - Required scopes (classic): repo (full)
#    - Fine-grained: Contents = Read & Write, targeting the kaven-co/kaven-template repo
# 2. In the kaven-framework repo, go to Settings → Secrets and variables → Actions
# 3. Click "New repository secret"
# 4. Name: TEMPLATE_REPO_TOKEN
# 5. Value: paste the PAT you created
# 6. Click "Add secret"
#
# USAGE (local):
#   TEMPLATE_REPO_TOKEN=ghp_xxx FRAMEWORK_SHA=$(git rev-parse HEAD) bash .github/scripts/generate-template.sh
#
# USAGE (CI): called by .github/workflows/sync-template.yml

set -euo pipefail

# ---------------------------------------------------------------------------
# Validate required env vars
# ---------------------------------------------------------------------------
if [[ -z "${TEMPLATE_REPO_TOKEN:-}" ]]; then
  echo "ERROR: TEMPLATE_REPO_TOKEN is not set." >&2
  exit 1
fi

FRAMEWORK_SHA="${FRAMEWORK_SHA:-$(git rev-parse HEAD)}"
TEMPLATE_REPO="https://x-access-token:${TEMPLATE_REPO_TOKEN}@github.com/kaven-co/kaven-template.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRAMEWORK_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TMP_COPY="$(mktemp -d)"
TMP_TEMPLATE="$(mktemp -d)"
SHORT_SHA="${FRAMEWORK_SHA:0:8}"

echo "INFO: Framework root : ${FRAMEWORK_ROOT}"
echo "INFO: Commit SHA      : ${FRAMEWORK_SHA}"
echo "INFO: Temp copy dir   : ${TMP_COPY}"
echo "INFO: Temp template   : ${TMP_TEMPLATE}"

# ---------------------------------------------------------------------------
# Step 1 — Copy framework to temp dir, excluding private/generated paths
# ---------------------------------------------------------------------------
echo "INFO: Copying framework source to temp dir (excluding private paths)..."

rsync -a \
  --exclude='.git/' \
  --exclude='**/node_modules/' \
  --exclude='.aiox-core/' \
  --exclude='.aiox/' \
  --exclude='.aios-core/' \
  --exclude='.aios/' \
  --exclude='.aios-core-backup-*/' \
  --exclude='squads/' \
  --exclude='**/dist/' \
  --exclude='**/build/' \
  --exclude='**/.turbo/' \
  --exclude='**/coverage/' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.*.local' \
  --exclude='**/*.log' \
  --exclude='docs/sessions/' \
  --exclude='_business/' \
  --exclude='lp/' \
  --exclude='Kaven-Limbo/' \
  --exclude='kaven-context-export/' \
  --exclude='COMPANIOS-PRE-PRD.md' \
  --exclude='AIOX-KAVEN-INTEGRATION.md' \
  --exclude='brandbook-v2.0.1.pt.md' \
  --exclude='playbook-*.md' \
  --exclude='squads.backup-pre-aios-4.2.0/' \
  --exclude='2026-*-*.txt' \
  --exclude='migrate-workflow-to-*.py' \
  --exclude='install-squads.sh' \
  --exclude='validate-squad.js' \
  --exclude='src/' \
  --exclude='.codex/' \
  --exclude='.gemini/' \
  --exclude='.serena/' \
  --exclude='.claude/' \
  --exclude='**/__pycache__/' \
  --exclude='**/*.pyc' \
  "${FRAMEWORK_ROOT}/" "${TMP_COPY}/"

echo "INFO: Copy complete. File count: $(find "${TMP_COPY}" -type f | wc -l)"

# ---------------------------------------------------------------------------
# Step 2 — Clone kaven-template (shallow, single branch)
# ---------------------------------------------------------------------------
echo "INFO: Cloning kaven-co/kaven-template (shallow)..."
git clone --depth=1 "${TEMPLATE_REPO}" "${TMP_TEMPLATE}"

# ---------------------------------------------------------------------------
# Step 3 — Wipe template content (keep .git/) and replace with new snapshot
# ---------------------------------------------------------------------------
echo "INFO: Replacing template content..."

# Remove everything except .git in the template clone
find "${TMP_TEMPLATE}" -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +

# Copy snapshot into template clone
cp -r "${TMP_COPY}/." "${TMP_TEMPLATE}/"

# ---------------------------------------------------------------------------
# Step 4 — Commit and push if there are changes
# ---------------------------------------------------------------------------
cd "${TMP_TEMPLATE}"

git config user.email "github-actions[bot]@users.noreply.github.com"
git config user.name "github-actions[bot]"

if git diff --quiet && git diff --cached --quiet; then
  # Check for untracked files too
  if [[ -z "$(git status --porcelain)" ]]; then
    echo "INFO: No changes detected. Template is already up to date."
    exit 0
  fi
fi

git add -A

COMMIT_MSG="chore: sync from kaven-framework@${SHORT_SHA}"
echo "INFO: Committing: ${COMMIT_MSG}"
git commit -m "${COMMIT_MSG}"

echo "INFO: Pushing to kaven-co/kaven-template main..."
git push origin main

echo "INFO: Sync complete — kaven-template updated to kaven-framework@${SHORT_SHA}"

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------
rm -rf "${TMP_COPY}" "${TMP_TEMPLATE}"
echo "INFO: Temp directories cleaned up."
