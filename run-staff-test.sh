#!/bin/bash

echo "========================================"
echo "  OrderBean Staff Dashboard Test"
echo "========================================"
echo ""
echo "This test will verify real-time updates work correctly."
echo ""
echo "Prerequisites:"
echo "  1. Dev server running (pnpm run dev)"
echo "  2. Redis credentials in .env"
echo "  3. Test accounts exist in database"
echo ""
echo "Starting tests in 3 seconds..."
sleep 3

# Run debug tests first to check SSE connection
echo ""
echo "Step 1: Running debug tests..."
echo "----------------------------------------"
pnpm exec playwright test e2e/debug-sse-redis.spec.ts --project=chromium --reporter=line

echo ""
echo "Step 2: Running full real-time update test..."
echo "----------------------------------------"
pnpm exec playwright test e2e/staff-realtime-updates.spec.ts --project=chromium --reporter=line --headed

echo ""
echo "========================================"
echo "  Tests Complete!"
echo "========================================"
echo ""
echo "If tests failed, check:"
echo "  - test-results/ folder for screenshots"
echo "  - Server console for Redis errors"
echo "  - Browser console logs in test output"
echo ""
