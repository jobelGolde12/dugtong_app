#!/bin/bash

echo "=========================================="
echo "React Native Refactoring Verification"
echo "=========================================="
echo ""

# Check if @libsql/client is still in package.json
echo "1. Checking if @libsql/client is removed..."
if grep -q "@libsql/client" package.json; then
    echo "   ❌ FAIL: @libsql/client still in package.json"
else
    echo "   ✅ PASS: @libsql/client removed"
fi

# Check if Turso files are deleted
echo ""
echo "2. Checking if Turso files are deleted..."
TURSO_FILES=(
    "src/lib/turso.ts"
    "src/lib/database.ts"
    "src/lib/database-api.ts"
    "src/lib/turso-offline.ts"
    "src/services/donorService.ts"
    "src/services/OfflineService.ts"
)

ALL_DELETED=true
for file in "${TURSO_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ❌ FAIL: $file still exists"
        ALL_DELETED=false
    fi
done

if [ "$ALL_DELETED" = true ]; then
    echo "   ✅ PASS: All Turso files deleted"
fi

# Check if new files are created
echo ""
echo "3. Checking if new API files are created..."
NEW_FILES=(
    "src/config/api.ts"
    "src/services/apiClient.ts"
    "api/blood-requests.ts"
    ".env.example"
    "REACT_NATIVE_ENV_SETUP.md"
    "REFACTORING_SUMMARY.md"
)

ALL_CREATED=true
for file in "${NEW_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ❌ FAIL: $file not found"
        ALL_CREATED=false
    fi
done

if [ "$ALL_CREATED" = true ]; then
    echo "   ✅ PASS: All new files created"
fi

# Check for remaining Turso imports in app code (excluding scripts)
echo ""
echo "4. Checking for remaining Turso imports in app code..."
TURSO_IMPORTS=$(grep -r "from.*turso\|@libsql/client" --include="*.ts" --include="*.tsx" app/ contexts/ hooks/ lib/ src/ api/ 2>/dev/null | grep -v "node_modules" | wc -l)

if [ "$TURSO_IMPORTS" -eq 0 ]; then
    echo "   ✅ PASS: No Turso imports in app code"
else
    echo "   ❌ FAIL: Found $TURSO_IMPORTS Turso imports in app code"
    grep -r "from.*turso\|@libsql/client" --include="*.ts" --include="*.tsx" app/ contexts/ hooks/ lib/ src/ api/ 2>/dev/null | grep -v "node_modules"
fi

# Check if API_BASE_URL is configured
echo ""
echo "5. Checking API configuration..."
if grep -q "API_BASE_URL" src/config/api.ts; then
    echo "   ✅ PASS: API_BASE_URL configured"
else
    echo "   ❌ FAIL: API_BASE_URL not configured"
fi

# Check if apiClient is created
echo ""
echo "6. Checking API client..."
if grep -q "class ApiClient" src/services/apiClient.ts; then
    echo "   ✅ PASS: API client created"
else
    echo "   ❌ FAIL: API client not found"
fi

echo ""
echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Set EXPO_PUBLIC_API_BASE_URL in .env"
echo "2. Ensure Next.js backend is running"
echo "3. Run 'npm install' to update dependencies"
echo "4. Run 'npx expo start' to test the app"
echo ""
