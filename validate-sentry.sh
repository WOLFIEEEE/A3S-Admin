#!/bin/bash

# Sentry Integration Validation Script
# This script validates that Sentry is properly integrated

set -e

echo "🔍 Sentry Integration Validation Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
PASSED=0
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((FAILED++))
        return 1
    fi
}

# Function to check content in file
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Found '$2' in $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} Missing '$2' in $1"
        ((FAILED++))
        return 1
    fi
}

echo "📁 Checking Sentry Files..."
echo ""

# Check core files
check_file "src/lib/sentry/index.ts"
check_file "src/lib/sentry/api-error-handler.ts"
check_file "src/components/error-boundary.tsx"
check_file "src/instrumentation.ts"
check_file "src/instrumentation-client.ts"
check_file "SENTRY_INTEGRATION.md"
check_file "SENTRY_VERIFICATION.md"

echo ""
echo "🔧 Checking Sentry Configuration..."
echo ""

# Check instrumentation content
check_content "src/instrumentation.ts" "Sentry.init"
check_content "src/instrumentation-client.ts" "Sentry.init"
check_content "src/lib/sentry/index.ts" "captureException"
check_content "src/lib/sentry/api-error-handler.ts" "withAPIErrorHandler"
check_content "src/components/error-boundary.tsx" "ErrorBoundary"

echo ""
echo "📦 Checking Dependencies..."
echo ""

# Check if @sentry/nextjs is installed
if grep -q "@sentry/nextjs" package.json; then
    echo -e "${GREEN}✓${NC} @sentry/nextjs dependency found"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} @sentry/nextjs dependency missing"
    ((FAILED++))
fi

echo ""
echo "🏗️  Running Production Build..."
echo ""

# Try to build
if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Production build successful"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Production build failed"
    ((FAILED++))
fi

echo ""
echo "📋 Checking Environment Variables..."
echo ""

# Check if env.example has Sentry variables
if grep -q "NEXT_PUBLIC_SENTRY_DSN" docs/env.example 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Sentry environment variables documented"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Sentry environment variables not in docs/env.example"
fi

echo ""
echo "========================================"
echo "📊 Validation Results"
echo "========================================"
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Sentry is properly integrated.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add NEXT_PUBLIC_SENTRY_DSN to your .env.local"
    echo "2. Deploy and test error tracking"
    echo "3. Check Sentry dashboard for events"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review the errors above.${NC}"
    echo ""
    exit 1
fi

