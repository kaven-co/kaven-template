#!/usr/bin/env bash
# .agent/scripts/evidence-bundle.sh
# KAVEN AGENT CORE - Evidence Bundle Generator
# Version: 1.0.0
# Purpose: Generate complete evidence bundle in JSON format

set -euo pipefail

# ============================================================================== 
# CONFIGURATION
# ==============================================================================

EVIDENCE_DIR=".agent/artifacts/evidence"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
WORKFLOW=${1:-"manual"}
PHASE=${2:-"unknown"}
BUNDLE_ID=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "$(date +%s)-$$")
BUNDLE_FILE="$EVIDENCE_DIR/${TIMESTAMP}__${WORKFLOW}__${PHASE}.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "$EVIDENCE_DIR"

echo ""
echo "📦 Generating Evidence Bundle"
echo ""
echo "  ID: $BUNDLE_ID"
echo "  Workflow: $WORKFLOW"
echo "  Phase: $PHASE"
echo ""

# ==============================================================================
# GIT EVIDENCE
# ==============================================================================

echo "🔍 Collecting git evidence..."

GIT_BEFORE=$(git log -1 --format="%H" HEAD~1 2>/dev/null || echo "initial")
GIT_AFTER=$(git log -1 --format="%H" HEAD 2>/dev/null || echo "current")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

GIT_DIFF_STAT=$(git diff --stat HEAD~1..HEAD 2>/dev/null || echo "No changes")
GIT_FILES_CHANGED=$(git diff --numstat HEAD~1..HEAD 2>/dev/null | wc -l || echo "0")
GIT_LINES_ADDED=$(git diff --numstat HEAD~1..HEAD 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
GIT_LINES_REMOVED=$(git diff --numstat HEAD~1..HEAD 2>/dev/null | awk '{sum+=$2} END {print sum+0}')

# Get diff patch (truncate at 10k lines)
GIT_DIFF_PATCH=$(git diff HEAD~1..HEAD 2>/dev/null | head -n 10000 || echo "")

echo "  Files changed: $GIT_FILES_CHANGED"
echo "  Lines added: $GIT_LINES_ADDED"
echo "  Lines removed: $GIT_LINES_REMOVED"

# ==============================================================================
# QUALITY GATES
# ==============================================================================

echo ""
echo "🧪 Running quality gates..."

# Initialize results
LINT_PASSED="false"
LINT_OUTPUT=""
LINT_DURATION=0

TYPE_PASSED="false"
TYPE_OUTPUT=""
TYPE_ERRORS=0
TYPE_DURATION=0

TEST_PASSED="false"
TEST_OUTPUT=""
TEST_PASSED_COUNT=0
TEST_FAILED_COUNT=0
TEST_DURATION=0

COVERAGE_LINES=0
COVERAGE_STATEMENTS=0
COVERAGE_FUNCTIONS=0
COVERAGE_BRANCHES=0

# Detect package manager
if [[ -f "package.json" ]]; then
    if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
        PKG_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
    else
        PKG_MANAGER=""
    fi
    
    if [[ -n "$PKG_MANAGER" ]]; then
        
        # --- LINT ---
        if grep -q '"lint"' package.json; then
            echo "  📋 Running lint..."
            LINT_START=$(date +%s%N)
            
            set +e
            LINT_OUTPUT=$($PKG_MANAGER run lint 2>&1)
            LINT_EXIT=$?
            set -e
            
            LINT_END=$(date +%s%N)
            LINT_DURATION=$(( (LINT_END - LINT_START) / 1000000 ))
            
            if [[ $LINT_EXIT -eq 0 ]]; then
                LINT_PASSED="true"
                echo -e "    ${GREEN}✅ Passed${NC} (${LINT_DURATION}ms)"
            else
                echo -e "    ${RED}❌ Failed${NC} (${LINT_DURATION}ms)"
            fi
        fi
        
        # --- TYPECHECK ---
        if grep -q '"typecheck"' package.json; then
            echo "  🔍 Running typecheck..."
            TYPE_START=$(date +%s%N)
            
            set +e
            TYPE_OUTPUT=$($PKG_MANAGER run typecheck 2>&1)
            TYPE_EXIT=$?
            set -e
            
            TYPE_END=$(date +%s%N)
            TYPE_DURATION=$(( (TYPE_END - TYPE_START) / 1000000 ))
            
            if [[ $TYPE_EXIT -eq 0 ]]; then
                TYPE_PASSED="true"
                TYPE_ERRORS=0
                echo -e "    ${GREEN}✅ Passed${NC} (${TYPE_DURATION}ms)"
            else
                TYPE_ERRORS=$(echo "$TYPE_OUTPUT" | grep -c "error TS" || echo "0")
                echo -e "    ${RED}❌ Failed${NC} ($TYPE_ERRORS errors, ${TYPE_DURATION}ms)"
            fi
        fi
        
        # --- TESTS ---
        if grep -q '"test"' package.json; then
            echo "  🧪 Running tests..."
            TEST_START=$(date +%s%N)
            
            set +e
            TEST_OUTPUT=$($PKG_MANAGER run test 2>&1)
            TEST_EXIT=$?
            set -e
            
            TEST_END=$(date +%s%N)
            TEST_DURATION=$(( (TEST_END - TEST_START) / 1000000 ))
            
            if [[ $TEST_EXIT -eq 0 ]]; then
                TEST_PASSED="true"
                TEST_PASSED_COUNT=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= passed)' | head -1 || echo "0")
                TEST_FAILED_COUNT=0
                echo -e "    ${GREEN}✅ Passed${NC} ($TEST_PASSED_COUNT tests, ${TEST_DURATION}ms)"
            else
                TEST_PASSED_COUNT=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= passed)' | head -1 || echo "0")
                TEST_FAILED_COUNT=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= failed)' | head -1 || echo "0")
                echo -e "    ${RED}❌ Failed${NC} ($TEST_FAILED_COUNT failed, ${TEST_DURATION}ms)"
            fi
            
            # Extract coverage if available
            COVERAGE_LINES=$(echo "$TEST_OUTPUT" | grep -oP 'Lines\s*:\s*\K[\d\.]+' || echo "0")
            COVERAGE_STATEMENTS=$(echo "$TEST_OUTPUT" | grep -oP 'Statements\s*:\s*\K[\d\.]+' || echo "0")
            COVERAGE_FUNCTIONS=$(echo "$TEST_OUTPUT" | grep -oP 'Functions\s*:\s*\K[\d\.]+' || echo "0")
            COVERAGE_BRANCHES=$(echo "$TEST_OUTPUT" | grep -oP 'Branches\s*:\s*\K[\d\.]+' || echo "0")
        fi
    fi
fi

# ==============================================================================
# METADATA
# ==============================================================================

DEVELOPER=$(git config user.name || echo "unknown")
ENVIRONMENT=${NODE_ENV:-"development"}
PLATFORM=$(uname -s || echo "unknown")
NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
CLI_VERSION=$(cat package.json 2>/dev/null | grep -oP '"version":\s*"\K[^"]+' || echo "unknown")

# ==============================================================================
# GENERATE JSON
# ==============================================================================

echo ""
echo "📝 Writing Evidence Bundle..."

# Helper function to escape JSON strings
json_escape() {
    echo "$1" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' ' ' | sed 's/  */ /g'
}

# Truncate outputs to max 1000 lines
LINT_OUTPUT_TRUNCATED=$(echo "$LINT_OUTPUT" | head -n 1000)
TYPE_OUTPUT_TRUNCATED=$(echo "$TYPE_OUTPUT" | head -n 1000)
TEST_OUTPUT_TRUNCATED=$(echo "$TEST_OUTPUT" | head -n 1000)
GIT_DIFF_STAT_TRUNCATED=$(echo "$GIT_DIFF_STAT" | head -n 1000)

# Generate JSON
cat > "$BUNDLE_FILE" <<EOF
{
  "id": "$BUNDLE_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "workflow": "$WORKFLOW",
  "phase": "$PHASE",
  "git": {
    "beforeCommit": "$GIT_BEFORE",
    "afterCommit": "$GIT_AFTER",
    "branch": "$GIT_BRANCH",
    "diffStat": $(echo "$GIT_DIFF_STAT_TRUNCATED" | jq -Rs .),
    "filesChanged": $GIT_FILES_CHANGED,
    "linesAdded": $GIT_LINES_ADDED,
    "linesRemoved": $GIT_LINES_REMOVED,
    "diffPatch": $(echo "$GIT_DIFF_PATCH" | jq -Rs .)
  },
  "qualityGates": {
    "lint": {
      "passed": $LINT_PASSED,
      "output": $(echo "$LINT_OUTPUT_TRUNCATED" | jq -Rs .),
      "duration": $LINT_DURATION
    },
    "typecheck": {
      "passed": $TYPE_PASSED,
      "output": $(echo "$TYPE_OUTPUT_TRUNCATED" | jq -Rs .),
      "errorsFound": $TYPE_ERRORS,
      "duration": $TYPE_DURATION
    },
    "test": {
      "passed": $TEST_PASSED,
      "output": $(echo "$TEST_OUTPUT_TRUNCATED" | jq -Rs .),
      "testsPassed": $TEST_PASSED_COUNT,
      "testsFailed": $TEST_FAILED_COUNT,
      "coverage": {
        "lines": $COVERAGE_LINES,
        "statements": $COVERAGE_STATEMENTS,
        "functions": $COVERAGE_FUNCTIONS,
        "branches": $COVERAGE_BRANCHES
      },
      "duration": $TEST_DURATION
    }
  },
  "metadata": {
    "developer": "$DEVELOPER",
    "environment": "$ENVIRONMENT",
    "platform": "$PLATFORM",
    "nodeVersion": "$NODE_VERSION",
    "cliVersion": "$CLI_VERSION"
  }
}
EOF

# ==============================================================================
# SUMMARY
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📊 Evidence Bundle Summary${NC}"
echo ""
echo "  File: $BUNDLE_FILE"
echo "  Size: $(du -h "$BUNDLE_FILE" | cut -f1)"
echo ""
echo "  📈 Changes:"
echo "    Files changed: $GIT_FILES_CHANGED"
echo "    Lines added: $GIT_LINES_ADDED"
echo "    Lines removed: $GIT_LINES_REMOVED"
echo ""
echo "  🧪 Quality Gates:"
echo -n "    Lint: "
[[ "$LINT_PASSED" == "true" ]] && echo -e "${GREEN}✅ Passed${NC}" || echo -e "${RED}❌ Failed${NC}"
echo -n "    Typecheck: "
[[ "$TYPE_PASSED" == "true" ]] && echo -e "${GREEN}✅ Passed${NC} (0 errors)" || echo -e "${RED}❌ Failed${NC} ($TYPE_ERRORS errors)"
echo -n "    Tests: "
[[ "$TEST_PASSED" == "true" ]] && echo -e "${GREEN}✅ Passed${NC} ($TEST_PASSED_COUNT passed)" || echo -e "${RED}❌ Failed${NC} ($TEST_FAILED_COUNT failed)"

echo ""

# Check if all gates passed
if [[ "$LINT_PASSED" == "true" ]] && [[ "$TYPE_PASSED" == "true" ]] && [[ "$TEST_PASSED" == "true" ]]; then
    echo -e "${GREEN}✅ Evidence Bundle generated successfully!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Quality gates failed. Evidence bundle contains failure details.${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi
