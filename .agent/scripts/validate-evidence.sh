#!/usr/bin/env bash
# .agent/scripts/validate-evidence.sh
# KAVEN AGENT CORE - Evidence Bundle Validator
# Version: 1.0.0
# Purpose: Validate evidence bundle JSON files

set -euo pipefail

EVIDENCE_FILE=$1

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [[ -z "$EVIDENCE_FILE" ]]; then
    echo -e "${RED}❌ Error: No evidence file specified${NC}"
    echo ""
    echo "Usage: $0 <evidence-file.json>"
    exit 1
fi

if [[ ! -f "$EVIDENCE_FILE" ]]; then
    echo -e "${RED}❌ Error: Evidence file not found: $EVIDENCE_FILE${NC}"
    exit 1
fi

echo ""
echo "🔍 Validating Evidence Bundle: $(basename $EVIDENCE_FILE)"
echo ""

# ==============================================================================
# 1. CHECK JSON VALIDITY
# ==============================================================================

echo "  Checking JSON validity..."

if ! jq empty "$EVIDENCE_FILE" 2>/dev/null; then
    echo -e "${RED}  ❌ Invalid JSON${NC}"
    exit 1
fi

echo -e "${GREEN}  ✅ Valid JSON${NC}"

# ==============================================================================
# 2. CHECK REQUIRED FIELDS
# ==============================================================================

echo "  Checking required fields..."

REQUIRED_FIELDS=(
    ".id"
    ".timestamp"
    ".workflow"
    ".git.afterCommit"
    ".git.filesChanged"
    ".qualityGates.lint.passed"
    ".qualityGates.typecheck.passed"
    ".qualityGates.test.passed"
)

MISSING_FIELDS=()

for field in "${REQUIRED_FIELDS[@]}"; do
    VALUE=$(jq -r "$field" "$EVIDENCE_FILE" 2>/dev/null || echo "null")
    
    if [[ "$VALUE" == "null" ]] || [[ -z "$VALUE" ]]; then
        MISSING_FIELDS+=("$field")
    fi
done

if [[ ${#MISSING_FIELDS[@]} -gt 0 ]]; then
    echo -e "${RED}  ❌ Missing required fields:${NC}"
    for field in "${MISSING_FIELDS[@]}"; do
        echo "      $field"
    done
    exit 1
fi

echo -e "${GREEN}  ✅ All required fields present${NC}"

# ==============================================================================
# 3. CHECK QUALITY GATES
# ==============================================================================

echo "  Checking quality gates..."

LINT_PASSED=$(jq -r '.qualityGates.lint.passed' "$EVIDENCE_FILE")
TYPE_PASSED=$(jq -r '.qualityGates.typecheck.passed' "$EVIDENCE_FILE")
TEST_PASSED=$(jq -r '.qualityGates.test.passed' "$EVIDENCE_FILE")

GATES_FAILED=0

if [[ "$LINT_PASSED" != "true" ]]; then
    echo -e "${RED}    ❌ Lint failed${NC}"
    GATES_FAILED=1
else
    echo -e "${GREEN}    ✅ Lint passed${NC}"
fi

if [[ "$TYPE_PASSED" != "true" ]]; then
    TYPE_ERRORS=$(jq -r '.qualityGates.typecheck.errorsFound' "$EVIDENCE_FILE")
    echo -e "${RED}    ❌ Typecheck failed ($TYPE_ERRORS errors)${NC}"
    GATES_FAILED=1
else
    echo -e "${GREEN}    ✅ Typecheck passed${NC}"
fi

if [[ "$TEST_PASSED" != "true" ]]; then
    TEST_FAILED=$(jq -r '.qualityGates.test.testsFailed' "$EVIDENCE_FILE")
    echo -e "${RED}    ❌ Tests failed ($TEST_FAILED tests)${NC}"
    GATES_FAILED=1
else
    TEST_PASSED_COUNT=$(jq -r '.qualityGates.test.testsPassed' "$EVIDENCE_FILE")
    echo -e "${GREEN}    ✅ Tests passed ($TEST_PASSED_COUNT tests)${NC}"
fi

# ==============================================================================
# 4. SUMMARY
# ==============================================================================

echo ""

if [[ $GATES_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✅ Evidence Bundle is valid${NC}"
    echo ""
    
    # Display summary
    FILES_CHANGED=$(jq -r '.git.filesChanged' "$EVIDENCE_FILE")
    LINES_ADDED=$(jq -r '.git.linesAdded' "$EVIDENCE_FILE")
    LINES_REMOVED=$(jq -r '.git.linesRemoved' "$EVIDENCE_FILE")
    
    echo "📊 Summary:"
    echo "  Files changed: $FILES_CHANGED"
    echo "  Lines added: $LINES_ADDED"
    echo "  Lines removed: $LINES_REMOVED"
    echo ""
    
    exit 0
else
    echo -e "${RED}❌ Quality gates failed in Evidence Bundle${NC}"
    echo ""
    echo "Review the evidence file for details:"
    echo "  $EVIDENCE_FILE"
    echo ""
    exit 1
fi
