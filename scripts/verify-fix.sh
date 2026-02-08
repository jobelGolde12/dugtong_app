#!/bin/bash

echo "=== NOTIFICATION FIX VERIFICATION ==="
echo ""

echo "1. Checking database connection..."
npx tsx scripts/diagnose.ts | grep -E "(Notifications:|Donors:)" || exit 1
echo ""

echo "2. Testing notification API..."
npx tsx scripts/test-notifications.ts | grep "All tests passed" || exit 1
echo ""

echo "3. Verifying NotificationContext fix..."
if grep -q "useAuth" contexts/NotificationContext.tsx; then
  echo "❌ FAILED: useAuth still imported (should be removed)"
  exit 1
else
  echo "✅ PASSED: useAuth removed"
fi

if grep -q "isAuthenticated && !isAuthLoading" contexts/NotificationContext.tsx; then
  echo "❌ FAILED: Auth check still present"
  exit 1
else
  echo "✅ PASSED: Auth check removed"
fi

if grep -q "NotificationFilter" contexts/NotificationContext.tsx; then
  echo "✅ PASSED: NotificationFilter imported"
else
  echo "❌ FAILED: NotificationFilter not imported"
  exit 1
fi

echo ""
echo "=== ALL CHECKS PASSED ==="
echo ""
echo "Next steps:"
echo "  1. Run: npx expo start"
echo "  2. Navigate to Notifications screen"
echo "  3. Verify notifications display"
echo ""
