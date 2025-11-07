#!/bin/bash

set -e

echo "=============================================="
echo "Starting Face Recognition API Test Runner..."
echo "=============================================="

echo "Running tests from scripts/test.api.ts..."
npx ts-node scripts/test-api.ts

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests executed successfully!"
else
    echo "❌ Tests encountered errors (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE