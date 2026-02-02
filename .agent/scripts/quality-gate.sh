#!/usr/bin/env bash
# .agent/scripts/quality-gate.sh
# Agent Core - Quality Gates Runner
# Version: 1.0.0
# Purpose: Run quality gates manually

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ==============================================================================
# PARSE ARGUMENTS
# ==============================================================================

RUN_ALL=false
RUN_LINT=false
RUN_TYPECHECK=false
RUN_TEST=false
RUN_BUILD=false

if [[ $# -eq 0 ]]; then
    RUN_ALL=true
else
    for arg in "$@"; do
        case $arg in
            lint) RUN_LINT=true ;;
            typecheck|type) RUN_TYPECHECK=true ;;
            test) RUN_TEST=true ;;
            build) RUN_BUILD=true ;;
            all) RUN_ALL=true ;;
            *)
                echo -e "${RED}❌ Unknown argument: $arg${NC}"
                echo ""
                echo "Usage: $0 [lint] [typecheck] [test] [build] [all]"
                echo ""
                echo "Examples:"
                echo "  $0              # Run all gates"
                echo "  $0 all          # Run all gates"
                echo "  $0 lint test    # Run only lint and test"
                exit 1
                ;;
        esac
    done
fi

# If all is specified, run everything
if [[ "$RUN_ALL" == "true" ]]; then
    RUN_LINT=true
    RUN_TYPECHECK=true
    RUN_TEST=true
    RUN_BUILD=true
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🧪 Running Quality Gates${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==============================================================================
# DETECT PACKAGE MANAGER
# ==============================================================================

if [[ ! -f "package.json" ]]; then
    echo -e "${YELLOW}⚠️  No package.json found. Not a Node.js project?${NC}"
    exit 0
fi

if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo -e "${RED}❌ No package manager found (pnpm or npm)${NC}"
    exit 1
fi

echo "📦 Using: $PKG_MANAGER"
echo ""

# ==============================================================================
# RUN GATES
# ==============================================================================

GATES_FAILED=0

# --- LINT ---
if [[ "$RUN_LINT" == "true" ]]; then
    if grep -q '"lint"' package.json; then
        echo "📋 Running lint..."
        if $PKG_MANAGER run lint; then
            echo -e "${GREEN}✅ Lint passed${NC}"
        else
            echo -e "${RED}❌ Lint failed${NC}"
            GATES_FAILED=$((GATES_FAILED + 1))
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  No lint script found, skipping${NC}"
        echo ""
    fi
fi

# --- TYPECHECK ---
if [[ "$RUN_TYPECHECK" == "true" ]]; then
    if grep -q '"typecheck"' package.json; then
        echo "🔍 Running typecheck..."
        if $PKG_MANAGER run typecheck; then
            echo -e "${GREEN}✅ Typecheck passed${NC}"
        else
            echo -e "${RED}❌ Typecheck failed${NC}"
            GATES_FAILED=$((GATES_FAILED + 1))
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  No typecheck script found, skipping${NC}"
        echo ""
    fi
fi

# --- TEST ---
if [[ "$RUN_TEST" == "true" ]]; then
    if grep -q '"test"' package.json; then
        echo "🧪 Running tests..."
        if $PKG_MANAGER run test; then
            echo -e "${GREEN}✅ Tests passed${NC}"
        else
            echo -e "${RED}❌ Tests failed${NC}"
            GATES_FAILED=$((GATES_FAILED + 1))
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  No test script found, skipping${NC}"
        echo ""
    fi
fi

# --- BUILD ---
if [[ "$RUN_BUILD" == "true" ]]; then
    if grep -q '"build"' package.json; then
        echo "🏗️  Running build..."
        if $PKG_MANAGER run build; then
            echo -e "${GREEN}✅ Build passed${NC}"
        else
            echo -e "${RED}❌ Build failed${NC}"
            GATES_FAILED=$((GATES_FAILED + 1))
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  No build script found, skipping${NC}"
        echo ""
    fi
fi

# ==============================================================================
# SUMMARY
# ==============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ $GATES_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✅ All quality gates passed!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $GATES_FAILED gate(s) failed${NC}"
    echo ""
    echo "Fix the errors above before continuing."
    echo ""
    exit 1
fi
